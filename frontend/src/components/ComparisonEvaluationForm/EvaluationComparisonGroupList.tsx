import { useEffect, useState } from "react";
import axios from "axios";
import EvaluationComparisonForm from "./ComparisonEvaluationForm";
import { useAuth } from "../../context/AuthContext";
import type { TrackWithGroups } from "../../types/selfEvaluation";

interface Props {
  cycleId: number;
  trackData: TrackWithGroups;
}

interface GroupedData {
  groupId: number;
  groupName: string;
  selfAverageScore: number;
  finalAverageScore: number;
  criteria: {
    criterionId: number;
    title: string;
    justification: string;
    selfScore: number;
    finalScore: number;
  }[];
}

const EvaluationComparisonGroupList = ({ cycleId, trackData }: Props) => {
  const { token, user } = useAuth();
  const [grouped, setGrouped] = useState<GroupedData[]>([]);

  const criterionTitleMap: Record<number, string> = {};
  trackData.CriterionGroup.forEach((group) => {
    group.configuredCriteria.forEach((cc) => {
      criterionTitleMap[cc.criterion.id] = cc.criterion.displayName;
    });
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Buscar dados da autoavaliação
        const selfRes = await axios.get(`http://localhost:3000/self-evaluation?cycleId=${cycleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const selfData = selfRes.data.find((e: any) => e.cycle.id === cycleId);
        if (!selfData) return;

        const groups: GroupedData[] = [];

        // 2. Buscar avaliação do gestor
        const managerRes = await axios.get(`http://localhost:3000/manager-evaluation/${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const managerData = managerRes.data;

        // 3. Agrupar autoavaliação
        selfData.items.forEach((item: any) => {
          const groupId = item.group?.id ?? 0;
          const groupName = item.group?.name ?? "Sem grupo";

          let group = groups.find((g) => g.groupId === groupId);
          if (!group) {
            group = {
              groupId,
              groupName,
              selfAverageScore: selfData.averageScore ?? 0,
              finalAverageScore: 0,
              criteria: [],
            };
            groups.push(group);
          }

          group.criteria.push({
            criterionId: item.criterionId,
            title: criterionTitleMap[item.criterionId] ?? "Sem título",
            justification: item.justification, // mantém justificativa original da autoavaliação
            selfScore: item.score,
            finalScore: 0,
          });
        });

        // 4. Preencher finalScore com base na avaliação do gestor, sem alterar justificativas
        managerData.items?.forEach((item: any) => {
          const group = groups.find((g) => g.groupId === item.groupId);
          const criterion = group?.criteria.find((c) => c.criterionId === item.criterionId);
          if (criterion) {
            criterion.finalScore = item.score;
          }
        });

        // 5. Calcular média final por grupo
        groups.forEach((group) => {
          const total = group.criteria.reduce((sum, c) => sum + c.finalScore, 0);
          group.finalAverageScore = group.criteria.length ? total / group.criteria.length : 0;
        });

        setGrouped(groups);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, [cycleId, token, trackData, user]);

  if (!grouped.length) return <div>Nenhuma resposta para este ciclo.</div>;

  return (
    <div className="p-3 bg-[#f1f1f1] space-y-6">
      {grouped.map((group) => (
        <EvaluationComparisonForm
          key={group.groupId}
          title={group.groupName}
          selfAverageScore={group.selfAverageScore}
          finalAverageScore={group.finalAverageScore}
          criteria={group.criteria.map((c) => ({
            title: c.title,
            selfScore: c.selfScore,
            finalScore: c.finalScore,
            justification: c.justification,
          }))}
        />
      ))}
    </div>
  );
};

export default EvaluationComparisonGroupList;
