import React, { useEffect, useState, useRef, useCallback } from "react";
import CriteriaSection from "../../components/manager/CriteriaSection";
import type { EvaluationCriterion } from "../../types/EvaluationManager.tsx";
import { useParams, useOutletContext } from "react-router-dom";
import {
  fetchManagerEvaluation,
  createManagerEvaluation,
  updateManagerEvaluation,
  getTracksWithCriteria,
  fetchActiveEvaluationCycle,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

type OutletContextType = {
  setSubmit: (fn: () => Promise<boolean>, isUpdate: boolean) => void;
  isEditing?: boolean;
  cycleId?: number | null;
};

type Group = {
  id: number;
  name: string;
  configuredCriteria: any[];
};

type TrackWithGroups = {
  id: number;
  name: string;
  CriterionGroup: Group[];
};

export default function CollaboratorEvaluation() {
  // LOG: início do componente
  console.log("Componente CollaboratorEvaluation montado");
  const { id: collaboratorId } = useParams();
  console.log("collaboratorId:", collaboratorId);
  const [groups, setGroups] = useState<Group[]>([]);
  const [criteriaState, setCriteriaState] = useState<
    Record<number, EvaluationCriterion[]>
  >({});
  const [evaluationId, setEvaluationId] = useState<number | null>(null);
  // Estado para controlar se está salvando
  const [isSaving, setIsSaving] = useState(false);
  // Ref para debounce
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(true);
  const [selfEvaluation, setSelfEvaluation] = useState<any>(null);
  const outletContext = useOutletContext<OutletContextType>();
  const isEditing = outletContext?.isEditing !== false;
  const [cycleId, setCycleId] = useState<number | null>(null);
  const [cycleStatus, setCycleStatus] = useState<string | null>(null);
  // Sempre priorize o cycleId do context (layout) se vier, senão usa local
  const effectiveCycleId = outletContext?.cycleId ?? cycleId;
  console.log("[DEBUG] isEditing recebido no filho:", isEditing);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCycle = async () => {
      setLoading(true); // Garante que loading inicia
      try {
        const cycle = await fetchActiveEvaluationCycle("MANAGER");
        setCycleId(cycle?.id || null);
        setCycleStatus(cycle?.status || null);
      } catch {
        setCycleId(null);
        setCycleStatus(null);
      } finally {
        setLoading(false); // Garante que loading termina mesmo se não houver ciclo
      }
    };
    fetchCycle();
  }, []);

  // Busca grupos e critérios dinâmicos do colaborador
  useEffect(() => {
    console.log("useEffect executado, collaboratorId:", collaboratorId);
    async function fetchGroupsAndCriteria() {
      if (!collaboratorId) {
        console.warn("collaboratorId indefinido, abortando fetch");
        return;
      }
      setLoading(true);
      try {
        // Busca todos os tracks com grupos/criterios
        const tracksData: TrackWithGroups[] = await getTracksWithCriteria();
        // Busca dados do colaborador avaliado
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/users/${collaboratorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const collaborator = await res.json();
        // Encontra o track do colaborador
        const userTrack = collaborator.trackId;
        const userUnit = collaborator.unitId;
        const userPosition = collaborator.positionId;
        const trackData = tracksData.find((t) => t.id === userTrack);
        if (!trackData) throw new Error("Trilha do colaborador não encontrada");
        // Filtra grupos do track que batem com unit/position
        const filteredGroups = trackData.CriterionGroup.filter((g) =>
          g.configuredCriteria.some(
            (cc) => cc.positionId === userPosition // removido: && cc.unitId === userUnit
          )
        ).map((g) => ({
          ...g,
          configuredCriteria: g.configuredCriteria.filter(
            (cc) => cc.positionId === userPosition // removido: && cc.unitId === userUnit
          ),
        }));

        setGroups(filteredGroups);
        // LOG: grupos filtrados
        console.log("filteredGroups:", filteredGroups);
        // Busca respostas do self evaluation do colaborador usando o endpoint correto
        const selfEvalRes = await axios.get(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/self-evaluation/user/${collaboratorId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Pega a avaliação do ciclo atual
        const selfEval = Array.isArray(selfEvalRes.data)
          ? selfEvalRes.data.find(
              (e: unknown) =>
                typeof e === "object" &&
                e &&
                "cycle" in e &&
                (e as { cycle: { id: number } }).cycle.id === cycleId
            )
          : null;
        setSelfEvaluation(selfEval);
        // Estado inicial dos critérios
        const initialState: Record<number, EvaluationCriterion[]> = {};
        filteredGroups.forEach((group) => {
          initialState[group.id] = group.configuredCriteria.map((cc) => {
            // Busca resposta do self evaluation para este critério
            let selfRating = 0;
            let selfJustification = "";
            let selfScoreDescription = "";
            if (selfEval && selfEval.items) {
              const found = selfEval.items.find(
                (item: { criterionId: number }) =>
                  item.criterionId === cc.criterion.id
              );
              if (found) {
                selfRating = found.score;
                selfJustification = found.justification;
                selfScoreDescription = found.scoreDescription || "";
              }
            }
            const critObj = {
              id: cc.criterion.id,
              title: cc.criterion.displayName || cc.criterion.name,
              description: cc.criterion.generalDescription || "",
              selfRating,
              selfJustification,
              selfScoreDescription,
              managerRating: undefined,
              managerJustification: "",
            };
            return critObj;
          });
        });
        console.log("initialState (criteriaState):", initialState);
        setCriteriaState(initialState);
        // Busca avaliação já existente
        const evaluation = await fetchManagerEvaluation(
          Number(collaboratorId),
          effectiveCycleId ?? undefined
        );
        if (evaluation && evaluation.groups) {
          // Se já existe avaliação, seta evaluationId para garantir update
          if (evaluation.id) setEvaluationId(evaluation.id);
          const newState: Record<number, EvaluationCriterion[]> = {
            ...initialState,
          };
          evaluation.groups.forEach(
            (g: {
              groupId: number;
              items: {
                criterionId: number;
                score: number;
                justification: string;
              }[];
            }) => {
              if (!newState[g.groupId]) return;
              newState[g.groupId] = newState[g.groupId].map((crit) => {
                const found = g.items.find((c) => c.criterionId === crit.id);
                return found
                  ? {
                      ...crit,
                      managerRating: found.score,
                      managerJustification: found.justification,
                    }
                  : crit;
              });
            }
          );
          setCriteriaState(newState);
        }
        setLoading(false);
      } catch (e) {
        console.error("Erro no fetchGroupsAndCriteria:", e);
        setSelfEvaluation(null);
        setLoading(false);
      }
    }
    if (collaboratorId && cycleId && cycleStatus === "IN_PROGRESS_MANAGER") {
      fetchGroupsAndCriteria();
    }
    // eslint-disable-next-line
  }, [collaboratorId, cycleId, cycleStatus]);

  const handleCriterionChange = (
    groupId: number,
    index: number,
    updated: Partial<EvaluationCriterion>
  ) => {
    setCriteriaState((prev) => {
      const arr = [...(prev[groupId] || [])];
      arr[index] = { ...arr[index], ...updated };
      return { ...prev, [groupId]: arr };
    });
  };

  // Função de auto-save: envia todos os critérios, mesmo incompletos
  const autoSave = useCallback(async () => {
    if (!collaboratorId || !effectiveCycleId) return;
    const groupsPayload = groups.map((group) => ({
      groupId: group.id,
      groupName: group.name,
      items: (criteriaState[group.id] || []).map((crit) => ({
        criterionId: crit.id,
        score: crit.managerRating,
        justification: crit.managerJustification,
      })),
    }));
    if (groupsPayload.length === 0) return;
    try {
      if (evaluationId) {
        await updateManagerEvaluation(
          Number(collaboratorId),
          {
            groups: groupsPayload,
          },
          effectiveCycleId as number
        );
      } else {
        const res = await createManagerEvaluation({
          evaluateeId: Number(collaboratorId),
          cycleId: effectiveCycleId as number,
          groups: groupsPayload,
        });
        if (res && res.id) setEvaluationId(res.id);
      }
    } catch (e) {
      // Não alerta, só loga
      console.error("Erro ao auto-salvar avaliação do gestor:", e);
    }
  }, [criteriaState, groups, collaboratorId, evaluationId, effectiveCycleId]);

  // Auto-save: dispara a mesma lógica do botão sempre que criteriaState mudar
  useEffect(() => {
    if (!collaboratorId || !cycleId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      autoSave();
    }, 500);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [criteriaState, collaboratorId, cycleId, autoSave, effectiveCycleId]);

  // Mantém o submit manual para envio final (com validação)
  useEffect(() => {
    if (!outletContext?.setSubmit) return;
    outletContext.setSubmit(async () => {
      if (!collaboratorId || !effectiveCycleId) return false;
      // Monta o payload no formato esperado pela API
      const groupsPayload = groups.map((group) => ({
        groupId: group.id,
        groupName: group.name,
        items: (criteriaState[group.id] || []).map((crit) => ({
          criterionId: crit.id,
          score: crit.managerRating,
          justification: crit.managerJustification,
        })),
      }));
      // Validação: todos os critérios precisam de nota e justificativa
      const hasEmpty = groupsPayload.some((g) =>
        g.items.some(
          (item) =>
            !item.score ||
            item.score < 1 ||
            !item.justification ||
            item.justification.trim() === ""
        )
      );
      if (hasEmpty) {
        alert("Preencha todos os critérios antes de enviar.");
        return false;
      }
      try {
        if (evaluationId) {
          // Update
          await updateManagerEvaluation(
            Number(collaboratorId),
            {
              groups: groupsPayload,
              status: "submitted",
            },
            effectiveCycleId as number
          );
        } else {
          // Create
          await createManagerEvaluation({
            evaluateeId: Number(collaboratorId),
            cycleId: effectiveCycleId as number,
            groups: groupsPayload,
            status: "submitted",
          });
        }
        return true;
      } catch (e) {
        alert((e as Error)?.message || "Erro ao enviar avaliação");
        return false;
      }
    }, !!evaluationId);
  }, [
    criteriaState,
    groups,
    collaboratorId,
    evaluationId,
    outletContext,
    cycleId,
  ]);

  // LOG: antes do return
  console.log("groups (render):", groups);
  console.log("criteriaState (render):", criteriaState);
  groups.forEach((g) =>
    console.log(
      "Group:",
      g.name,
      "criteriaState[group.id]:",
      criteriaState[g.id]
    )
  );

  if (loading) return <div>Carregando...</div>;
  if (!cycleId || cycleStatus !== "IN_PROGRESS_MANAGER")
    return (
      <div className="text-gray-500 text-center mt-10 font-semibold bg-[#F1F1F1] border border-gray-300 rounded p-4 max-w-xl mx-auto">
        Nenhum ciclo de avaliação de gestor em andamento.
        <br />
        <span className="text-gray-700 text-sm font-normal">
          A avaliação de gestor só estará disponível durante o ciclo de
          avaliação do gestor.
        </span>
      </div>
    );
  if (!groups.length)
    return <div>Nenhum critério configurado para este colaborador.</div>;

  return (
    <div className="flex flex-col gap-6 p-0 m-0">
      {groups.map((group, idx) => {
        const isLast = idx === groups.length - 1;
        return (
          <div
            style={isLast ? { marginBottom: 0, paddingBottom: 0 } : {}}
            key={group.id}
          >
            <CriteriaSection
              title={group.name}
              criteria={criteriaState[group.id] || []}
              onCriterionChange={(i, upd) =>
                handleCriterionChange(group.id, i, upd)
              }
              readOnly={!isEditing}
            />
          </div>
        );
      })}
    </div>
  );
}
