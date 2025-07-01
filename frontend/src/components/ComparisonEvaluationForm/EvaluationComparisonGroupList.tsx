import { useEffect, useState } from "react";
import axios from "axios";
import EvaluationComparisonForm from "./ComparisonEvaluationForm";
import { useAuth } from "../../context/AuthContext";
import type { TrackWithGroups } from "../../types/selfEvaluation";
import type { SubmittedSelfEvaluationItem } from "../../types/evaluationComparison";

interface Props {
  trackData: TrackWithGroups;
  cycleId: number;
}

const EvaluationComparisonGroupList = ({ trackData, cycleId }: Props) => {
  const { token } = useAuth();
  const [answers, setAnswers] = useState<SubmittedSelfEvaluationItem[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/self-evaluation?cycleId=${cycleId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const current = response.data.find((e: any) => e.cycle.id === cycleId);
        if (current) {
          setAnswers(current.items);
        }
      } catch (err) {
        console.error("Erro ao buscar ciclo antigo:", err);
      }
    };

    fetch();
  }, [token, cycleId]);

  const grouped = trackData.CriterionGroup.map((group) => {
    const items = group.configuredCriteria.map((cc) => {
      const item = answers.find(
        (i) => i.criterionId === cc.criterion.id && i.group?.id === group.id
      );

      return {
        title: cc.criterion.displayName,
        selfScore: item?.score ?? 0,
        finalScore: 0,
        justification: item?.justification ?? "",
      };
    });

    return (
      <EvaluationComparisonForm
        key={group.id}
        title={group.name}
        criteria={items}
      />
    );
  });

  return <div className="p-3 bg-[#f1f1f1] space-y-6">{grouped}</div>;
};

export default EvaluationComparisonGroupList;
