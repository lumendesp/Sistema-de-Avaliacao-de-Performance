import React, { useEffect, useState } from "react";
import CriteriaSection from "../../components/manager/CriteriaSection";
import type { EvaluationCriterion } from "../../types/EvaluationManager.tsx";
import { useParams, useOutletContext } from "react-router-dom";
import {
  fetchManagerEvaluation,
  createManagerEvaluation,
  updateManagerEvaluation,
  getTracksWithCriteria,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

type OutletContextType = {
  setSubmit: (fn: () => Promise<boolean>, isUpdate: boolean) => void;
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
  const [loading, setLoading] = useState(true);
  const [selfEvaluation, setSelfEvaluation] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const outletContext = useOutletContext<OutletContextType>();
  const { token } = useAuth();

  // Exemplo: cicloId fixo, ajuste conforme necessário
  const cycleId = 1;

  // Busca grupos e critérios dinâmicos do colaborador
  useEffect(() => {
    console.log("useEffect executado, collaboratorId:", collaboratorId);
    async function fetchGroupsAndCriteria() {
      if (!collaboratorId) {
        console.warn("collaboratorId indefinido, abortando fetch");
        return;
      }
      setLoading(true);
      setLoaded(false);
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
            (cc) => cc.unitId === userUnit && cc.positionId === userPosition
          )
        ).map((g) => ({
          ...g,
          configuredCriteria: g.configuredCriteria.filter(
            (cc) => cc.unitId === userUnit && cc.positionId === userPosition
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
          ? selfEvalRes.data.find((e: any) => e.cycle.id === cycleId)
          : null;
        setSelfEvaluation(selfEval);
        // Estado inicial dos critérios
        const initialState: Record<number, EvaluationCriterion[]> = {};
        filteredGroups.forEach((group) => {
          console.log(
            "Montando critérios para group:",
            group.name,
            group.configuredCriteria
          );
          initialState[group.id] = group.configuredCriteria.map((cc: any) => {
            // Busca resposta do self evaluation para este critério
            let selfRating = 0;
            let selfJustification = "";
            let selfScoreDescription = "";
            if (selfEval && selfEval.items) {
              const found = selfEval.items.find(
                (item: any) => item.criterionId === cc.criterion.id
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
            console.log("Critério montado:", critObj);
            return critObj;
          });
        });
        console.log("initialState (criteriaState):", initialState);
        setCriteriaState(initialState);
        setLoaded(true);
        // Busca avaliação já existente
        const evaluation = await fetchManagerEvaluation(Number(collaboratorId));
        if (evaluation && evaluation.groups) {
          // Preenche notas já existentes
          const newState: Record<number, EvaluationCriterion[]> = {
            ...initialState,
          };
          evaluation.groups.forEach((g: any) => {
            if (!newState[g.groupId]) return;
            newState[g.groupId] = newState[g.groupId].map((crit, idx) => {
              const found = g.items.find((c: any) => c.criterionId === crit.id);
              return found
                ? {
                    ...crit,
                    managerRating: found.score,
                    managerJustification: found.justification,
                  }
                : crit;
            });
          });
          setCriteriaState(newState);
        }
        setLoaded(true);
      } catch (e) {
        console.error("Erro no fetchGroupsAndCriteria:", e);
        // Não limpe os grupos nem o criteriaState!
        setSelfEvaluation(null);
      } finally {
        setLoading(false);
      }
    }
    fetchGroupsAndCriteria();
    // eslint-disable-next-line
  }, [collaboratorId]);

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

  // Função para montar o payload e enviar avaliação do gestor
  useEffect(() => {
    if (!outletContext?.setSubmit) return;
    outletContext.setSubmit(async () => {
      if (!collaboratorId) return false;
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
        g.items.some((item) =>
          !item.score || item.score < 1 || !item.justification || item.justification.trim() === ""
        )
      );
      if (hasEmpty) {
        alert("Preencha todos os critérios antes de enviar.");
        return false;
      }
      try {
        if (evaluationId) {
          // Update
          await updateManagerEvaluation(Number(collaboratorId), {
            groups: groupsPayload,
          });
        } else {
          // Create
          await createManagerEvaluation({
            evaluateeId: Number(collaboratorId),
            cycleId,
            groups: groupsPayload,
          });
        }
        return true;
      } catch (e: any) {
        alert(e?.response?.data?.message || "Erro ao enviar avaliação");
        return false;
      }
    }, !!evaluationId);
  }, [criteriaState, groups, collaboratorId, evaluationId, outletContext, cycleId]);

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

  if (loading || !loaded) return <div>Carregando...</div>;
  if (!groups.length)
    return <div>Nenhum critério configurado para este colaborador.</div>;

  return (
    <div className="flex flex-col gap-4">
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
            />
          </div>
        );
      })}
    </div>
  );
}
