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

type OutletContextType = { setSubmit: (fn: () => Promise<boolean>, isUpdate: boolean) => void };

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
  const { id: collaboratorId } = useParams();
  const [groups, setGroups] = useState<Group[]>([]);
  const [criteriaState, setCriteriaState] = useState<Record<number, EvaluationCriterion[]>>({});
  const [evaluationId, setEvaluationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [selfEvaluation, setSelfEvaluation] = useState<any>(null);
  const outletContext = useOutletContext<OutletContextType>();
  const { token } = useAuth();

  // Exemplo: cicloId fixo, ajuste conforme necessário
  const cycleId = 1;

  // Busca grupos e critérios dinâmicos do colaborador
  useEffect(() => {
    async function fetchGroupsAndCriteria() {
      if (!collaboratorId) return;
      setLoading(true);
      try {
        // Busca todos os tracks com grupos/criterios
        const tracksData: TrackWithGroups[] = await getTracksWithCriteria();
        // Busca dados do colaborador avaliado
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users/${collaboratorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const collaborator = await res.json();
        // Encontra o track do colaborador
        const userTrack = collaborator.trackId;
        const userUnit = collaborator.unitId;
        const userPosition = collaborator.positionId;
        const trackData = tracksData.find((t) => t.id === userTrack);
        if (!trackData) throw new Error('Trilha do colaborador não encontrada');
        // Filtra grupos do track que batem com unit/position
        const filteredGroups = trackData.CriterionGroup.filter(
          (g) => g.configuredCriteria.some(
            (cc) => cc.unitId === userUnit && cc.positionId === userPosition
          )
        ).map((g) => ({
          ...g,
          configuredCriteria: g.configuredCriteria.filter(
            (cc) => cc.unitId === userUnit && cc.positionId === userPosition
          ),
        }));
        setGroups(filteredGroups);
        // Busca respostas do self evaluation do colaborador usando o endpoint correto
        const selfEvalRes = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/self-evaluation/user/${collaboratorId}`,
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
          initialState[group.id] = group.configuredCriteria.map((cc: any) => {
            // Busca resposta do self evaluation para este critério
            let selfRating = 0;
            let selfJustification = "";
            if (selfEval && selfEval.items) {
              const found = selfEval.items.find((item: any) => item.criterionId === cc.criterion.id);
              if (found) {
                selfRating = found.score;
                selfJustification = found.justification;
              }
            }
            return {
              id: cc.criterion.id,
              title: cc.criterion.name,
              selfRating,
              selfJustification,
              managerRating: undefined,
              managerJustification: "",
            };
          });
        });
        setCriteriaState(initialState);
        // Busca avaliação já existente
        const evaluation = await fetchManagerEvaluation(Number(collaboratorId));
        if (evaluation && evaluation.groups) {
          // Preenche notas já existentes
          const newState: Record<number, EvaluationCriterion[]> = { ...initialState };
          evaluation.groups.forEach((g: any) => {
            if (!newState[g.groupId]) return;
            newState[g.groupId] = newState[g.groupId].map((crit, idx) => {
              const found = g.items.find((c: any) => c.criterionId === crit.id);
              return found
                ? { ...crit, managerRating: found.score, managerJustification: found.justification }
                : crit;
            });
          });
          setCriteriaState(newState);
          setEvaluationId(evaluation.id);
        } else {
          setEvaluationId(null);
        }
      } catch (e) {
        setGroups([]);
        setCriteriaState({});
        setSelfEvaluation(null);
      } finally {
        setLoading(false);
      }
    }
    fetchGroupsAndCriteria();
    // eslint-disable-next-line
  }, [collaboratorId]);

  // Handler para alteração de critérios
  const handleCriterionChange = (groupId: number, index: number, updated: Partial<EvaluationCriterion>) => {
    setCriteriaState((prev) => {
      const arr = [...(prev[groupId] || [])];
      arr[index] = { ...arr[index], ...updated };
      return { ...prev, [groupId]: arr };
    });
  };

  // Função para ser chamada pelo botão fixo do layout
  const handleSubmit = async () => {
    const groupsPayload = groups.map((group) => ({
      groupId: group.id,
      groupName: group.name,
      items: (criteriaState[group.id] || []).map((c) => ({
        criterionId: c.id,
        score: c.managerRating ?? 0,
        justification: c.managerJustification || "",
      })),
    }));
    try {
      if (evaluationId) {
        await updateManagerEvaluation(Number(collaboratorId), { groups: groupsPayload });
      } else {
        await createManagerEvaluation({ evaluateeId: Number(collaboratorId), cycleId, groups: groupsPayload });
      }
      return true;
    } catch (e) {
      console.error('Erro ao enviar avaliação:', e);
      return false;
    }
  };

  // Registra a função de submit no layout ao montar
  useEffect(() => {
    if (outletContext && outletContext.setSubmit) {
      outletContext.setSubmit(handleSubmit, true); // sempre update
    }
    // eslint-disable-next-line
  }, [criteriaState, evaluationId, collaboratorId, groups]);

  if (loading) return <div>Carregando...</div>;
  if (!groups.length) return <div>Nenhum critério configurado para este colaborador.</div>;

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <CriteriaSection
          key={group.id}
          title={group.name}
          criteria={criteriaState[group.id] || []}
          onCriterionChange={(i, upd) => handleCriterionChange(group.id, i, upd)}
        />
      ))}
    </div>
  );
}
