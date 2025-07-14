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
    <section className="bg-white rounded-md p-8 shadow-md w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 w-full">
        <h2 className="text-lg font-bold text-[#08605F] whitespace-nowrap mr-4">
          {title}
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          <span className="bg-gray-100 text-[#08605F] font-bold text-base rounded px-4 py-1 flex items-center">
            {selfAvg}
          </span>
          <span className="bg-[#08605F] text-white font-bold text-base rounded px-4 py-1 flex items-center">
            {managerAvg}
          </span>
          <span className="bg-teal-100 text-[#17939A] font-medium text-base rounded px-4 py-1">
            {filledCount}/{criteria.length} preenchidos
          </span>
        </div>
      </div>
      {criteria.map((criterion, idx) => (
        <EvaluationCard
          key={criterion.id}
          criterion={criterion}
          index={idx}
          onChange={(updated) => onCriterionChange(idx, updated)}
          readOnly={readOnly}
        />
      ))}
    </section>
  );
}
