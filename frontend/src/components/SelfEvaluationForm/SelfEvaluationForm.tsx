import { useState } from "react";
import SelfEvaluationItem from "./SelfEvaluationItem";
import type { SelfEvaluationFormProps } from "../../types/selfEvaluation"
import ScoreBox from "../ScoreBox";

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
      <div className="flex justify-between items-center mb-4 pb-3">
        <h3 className="text-bg font-semibold text-green-main">{title}</h3>
        <div className="flex items-center gap-4">
          <ScoreBox score={averageScore} />
          <span className="bg-green-confirm bg-opacity-25 text-green-secondary font-bold text-sm px-3 py-1 rounded-md">
            {answeredCount}/{totalCount} preenchidos
          </span>
        </div>
      </div>
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
