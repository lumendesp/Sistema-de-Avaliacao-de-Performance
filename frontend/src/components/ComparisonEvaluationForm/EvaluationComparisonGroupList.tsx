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
  const { token } = useAuth();
  const [grouped, setGrouped] = useState<GroupedData[]>([]);

  // Mapeia criterionId -> displayName usando trackData
  const criterionTitleMap: Record<number, string> = {};
  trackData.CriterionGroup.forEach((group) => {
    group.configuredCriteria.forEach((cc) => {
      criterionTitleMap[cc.criterion.id] = cc.criterion.displayName;
    });
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/self-evaluation?cycleId=${cycleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const current = res.data.find((e: any) => e.cycle.id === cycleId);
        if (!current) return;

        const groups: GroupedData[] = [];

        current.items.forEach((item: any) => {
          const groupId = item.group?.id ?? 0;
          const groupName = item.group?.name ?? "Sem grupo";

          let group = groups.find((g) => g.groupId === groupId);
          if (!group) {
            group = {
              groupId,
              groupName,
              selfAverageScore: current.averageScore ?? 0,
              finalAverageScore: 0,
              criteria: [],
            };
            groups.push(group);
          }

          group.criteria.push({
            criterionId: item.criterionId,
            title: criterionTitleMap[item.criterionId] ?? "Sem título",
            justification: item.justification,
            selfScore: item.score,
            finalScore: item.finalScore ?? 0,
          });
        });

        setGrouped(groups);
      } catch (error) {
        console.error("Erro ao buscar dados da autoavaliação:", error);
      }
    };

    fetchData();
  }, [cycleId, token, trackData]);

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
