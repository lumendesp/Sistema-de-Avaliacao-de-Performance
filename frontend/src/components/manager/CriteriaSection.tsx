import React from "react";
import EvaluationCard from "./EvaluationCard.tsx";
import type { EvaluationCriterion } from "../../types/EvaluationManager.tsx";

interface CriteriaSectionProps {
  title: string;
  criteria: EvaluationCriterion[];
  onCriterionChange: (
    index: number,
    updated: Partial<EvaluationCriterion>
  ) => void;
  readOnly?: boolean;
}

export default function CriteriaSection({
  title,
  criteria,
  onCriterionChange,
  readOnly = false,
}: CriteriaSectionProps) {
  // Calcula quantos critérios estão preenchidos
  const filledCount = criteria.filter(
    (c) =>
      c.managerRating &&
      c.managerJustification &&
      c.managerJustification.trim().length > 0
  ).length;

  // Calcula médias
  const selfAvg =
    criteria.length > 0
      ? (
          criteria.reduce((acc, c) => acc + (c.selfRating || 0), 0) /
          criteria.length
        ).toFixed(1)
      : "-";

  const managerRatings = criteria.filter(
    (c) => c.managerRating && c.managerRating > 0
  );
  const managerAvg =
    managerRatings.length > 0
      ? (
          managerRatings.reduce((acc, c) => acc + (c.managerRating || 0), 0) /
          managerRatings.length
        ).toFixed(1)
      : "-";

  return (
    <section className="bg-white rounded-xl px-6 py-9 w-full overflow-x-hidden">
      <div className="flex flex-col w-full max-w-full">
        <h2 className="text-base sm:text-lg font-bold text-[#08605F] mr-0 sm:mr-4 w-full truncate max-w-full">
          {title}
        </h2>
        <div className="flex w-full max-w-full">
          <div className="flex items-center w-full justify-center sm:justify-end max-w-full overflow-x-hidden">
            <div className="flex flex-row gap-1 min-w-0 flex-shrink-0 flex-nowrap w-auto">
              <span className="bg-gray-100 text-[#08605F] font-bold text-base rounded px-3 py-1 flex items-center min-w-[3.5rem] max-w-[4.5rem] whitespace-nowrap">
                {selfAvg}
              </span>
              <span className="bg-[#08605F] text-white font-bold text-base rounded px-3 py-1 flex items-center min-w-[3.5rem] max-w-[4.5rem] whitespace-nowrap">
                {managerAvg}
              </span>
              <span className="bg-teal-100 text-[#17939A] font-medium text-base rounded px-3 py-1 min-w-[7rem] max-w-full whitespace-nowrap">
                {filledCount}/{criteria.length} preenchidos
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        {criteria.map((criterion, idx) => (
          <EvaluationCard
            key={criterion.id}
            criterion={criterion}
            index={idx}
            onChange={(updated) => onCriterionChange(idx, updated)}
            readOnly={readOnly}
          />
        ))}
      </div>
    </section>
  );
}
