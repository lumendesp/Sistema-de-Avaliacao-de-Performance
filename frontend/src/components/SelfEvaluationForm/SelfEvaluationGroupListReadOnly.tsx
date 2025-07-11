import { useEffect, useState } from "react";
import SelfEvaluationForm from "./SelfEvaluationForm";
import type { TrackWithGroups } from "../../types/selfEvaluation";

interface Props {
  trackData: TrackWithGroups;
  cycleId: number;
  selfEval: any;
}

const SelfEvaluationGroupListReadOnly = ({ trackData, cycleId, selfEval }: Props) => {
  // Preenche os critérios com as respostas do selfEval
  const [ratings, setRatings] = useState<Record<number, number[]>>({});
  const [justifications, setJustifications] = useState<Record<number, string[]>>({});

  useEffect(() => {
    const initialRatings: Record<number, number[]> = {};
    const initialJustifications: Record<number, string[]> = {};
    trackData.CriterionGroup.forEach((group) => {
      initialRatings[group.id] = group.configuredCriteria.map((cc: any) => {
        // Busca resposta apenas por criterionId, igual ao manager
        const answer = selfEval?.items?.find(
          (item: any) => item.criterionId === cc.criterion.id
        );
        return answer?.score ?? 0;
      });
      initialJustifications[group.id] = group.configuredCriteria.map((cc: any) => {
        const answer = selfEval?.items?.find(
          (item: any) => item.criterionId === cc.criterion.id
        );
        return answer?.justification ?? "";
      });
    });
    setRatings(initialRatings);
    setJustifications(initialJustifications);
  }, [trackData, selfEval]);

  const calculateGroupAverage = (criteria: { id: number }[], scores: number[]) => {
    let sum = 0;
    let count = 0;
    criteria.forEach((c, i) => {
      sum += scores[i] || 0;
      count++;
    });
    return count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
  };

  return (
    <div className="pb-24">
      {trackData.CriterionGroup.map((group) => (
        <SelfEvaluationForm
          key={group.id}
          title={group.name}
          cycleId={cycleId}
          averageScore={calculateGroupAverage(
            group.configuredCriteria.map((cc) => cc.criterion),
            ratings[group.id] ?? []
          )}
          criteria={group.configuredCriteria.map((cc, i) => ({
            id: cc.criterion.id,
            title: cc.criterion.displayName,
            description: cc.criterion.generalDescription,
            score: ratings[group.id]?.[i] ?? 0,
            justification: justifications[group.id]?.[i] ?? "",
          }))}
          readOnly={true}
        />
      ))}
    </div>
  );
};

export default SelfEvaluationGroupListReadOnly;
