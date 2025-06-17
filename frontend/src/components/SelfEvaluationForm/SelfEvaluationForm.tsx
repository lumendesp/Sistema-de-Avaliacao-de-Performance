import { useState } from "react";
import SelfEvaluationItem from "./SelfEvaluationItem";
import type { SelfEvaluationFormProps } from "../../types/selfEvaluation";

const SelfEvaluationForm = ({ title, criteria }: SelfEvaluationFormProps) => {
  const [ratings, setRatings] = useState<number[]>(Array(criteria.length).fill(0));
  const [justifications, setJustifications] = useState<string[]>(Array(criteria.length).fill(""));

  const handleRatingChange = (index: number, value: number) => {
    const newRatings = [...ratings];
    newRatings[index] = value;
    setRatings(newRatings);
  };

  const handleJustificationChange = (index: number, value: string) => {
    const newJustifications = [...justifications];
    newJustifications[index] = value;
    setJustifications(newJustifications);
  };

  const answeredCount = ratings.filter((r, i) => r > 0 && justifications[i].trim().length > 0).length;
  const totalCount = criteria.length;

  const averageScore =
    ratings.reduce((sum, score) => sum + score, 0) / totalCount;

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-bg font-semibold text-gray-700">{title}</h3>
        <span className="bg-teal-100 text-teal-900 text-sm px-3 py-1 rounded-full">
          {answeredCount}/{totalCount} preenchidos
        </span>
      </div>

      {/* Média visual */}
      <div className="w-full bg-gray-200 h-2 rounded mb-6 overflow-hidden">
        <div
          className="bg-teal-600 h-full transition-all"
          style={{ width: `${(averageScore / 5) * 100}%` }}
        />
      </div>

      {/* Lista de critérios */}
      <div className="space-y-6">
        {criteria.map((criterion, index) => (
          <SelfEvaluationItem
            key={index}
            index={index + 1}
            title={criterion.title}
            score={ratings[index]}
            justification={justifications[index]}
            setScore={(value) => handleRatingChange(index, value)}
            setJustification={(value) => handleJustificationChange(index, value)}
          />
        ))}
      </div>
    </div>
  );
};

export default SelfEvaluationForm;
