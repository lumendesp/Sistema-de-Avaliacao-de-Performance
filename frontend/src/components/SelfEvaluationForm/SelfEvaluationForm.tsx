import { useEffect, useState } from "react";
import SelfEvaluationItem from "./SelfEvaluationItem";
import type { SelfEvaluationFormProps } from "../../types/selfEvaluation";
import ScoreBox from "../ScoreBox";

const SelfEvaluationForm = ({
  title,
  cycleId,
  criteria,
  averageScore,
  readOnly = false,
  onRatingChange,
  onJustificationChange,
}: SelfEvaluationFormProps & {
  averageScore?: number;
  onRatingChange?: (index: number, value: number) => void;
  onJustificationChange?: (index: number, value: string) => void;
}) => {
  const totalCount = criteria.length;
  const answeredCount = criteria.filter((c) => c.score && c.justification?.trim()).length;

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full mb-6">
      <div className="flex justify-between items-center mb-4 pb-3">
        <h3 className="text-bg font-semibold text-green-main">{title}</h3>
        <div className="flex items-center gap-4">
          <ScoreBox score={averageScore ?? 0} />
          <span className="bg-green-confirm bg-opacity-25 text-green-secondary font-bold text-sm px-3 py-1 rounded-md">
            {answeredCount}/{totalCount} preenchidos
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {criteria.map((criterion, index) => (
          <SelfEvaluationItem
            key={criterion.id}
            index={index + 1}
            title={criterion.title}
            description={criterion.description}
            score={criterion.score ?? 0}
            justification={criterion.justification ?? ""}
            setScore={(value) =>
              onRatingChange ? onRatingChange(index, value) : null
            }
            setJustification={(value) =>
              onJustificationChange ? onJustificationChange(index, value) : null
            }
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
};

export default SelfEvaluationForm;
