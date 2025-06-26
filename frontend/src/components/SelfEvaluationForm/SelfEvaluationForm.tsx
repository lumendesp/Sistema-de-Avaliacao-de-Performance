import { useEffect, useState } from "react";
import SelfEvaluationItem from "./SelfEvaluationItem";
import type { SelfEvaluationFormProps } from "../../types/selfEvaluation";
import ScoreBox from "../ScoreBox";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useEvaluation } from "../../context/EvaluationsContext";

const SelfEvaluationForm = ({ title, criteria, readOnly = false }: SelfEvaluationFormProps) => {
  const [ratings, setRatings] = useState<number[]>(
    criteria.map((c) => c.score ?? 0)
  );
  const [justifications, setJustifications] = useState<string[]>(
    criteria.map((c) => c.justification ?? "")
  );
  const { token } = useAuth();
  const { setIsComplete, registerSubmitHandler } = useEvaluation();

  const handleRatingChange = (index: number, value: number) => {
    if (readOnly) return;
    const newRatings = [...ratings];
    newRatings[index] = value;
    setRatings(newRatings);
  };

  const handleJustificationChange = (index: number, value: string) => {
    if (readOnly) return;
    const newJustifications = [...justifications];
    newJustifications[index] = value;
    setJustifications(newJustifications);
  };

  const handleSubmit = async () => {
    if (ratings.some((r, i) => r <= 0 || justifications[i].trim() === "")) {
      alert("Por favor, preencha todos os critérios antes de enviar.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/self-evaluation",
        {
          cycleId: 1,
          items: criteria.map((criterion, i) => ({
            criterionId: criterion.id,
            score: ratings[i],
            justification: justifications[i],
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Autoavaliação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar autoavaliação:", error);
      alert("Erro ao enviar autoavaliação");
    }
  };

  useEffect(() => {
    const allFilled = ratings.every((r, i) => r > 0 && justifications[i].trim().length > 0);
    setIsComplete(allFilled);
  }, [ratings, justifications, setIsComplete]);

  useEffect(() => {
    registerSubmitHandler("self-evaluation", handleSubmit);
  }, [ratings, justifications]);

  const totalCount = criteria.length;
  const answeredCount = ratings.filter((r, i) => r > 0 && justifications[i].trim().length > 0).length;
  const averageScore = ratings.reduce((sum, score) => sum + score, 0) / totalCount;

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
            key={criterion.id}
            index={index + 1}
            title={criterion.title}
            description={criterion.description}
            score={ratings[index]}
            justification={justifications[index]}
            setScore={(value) => handleRatingChange(index, value)}
            setJustification={(value) => handleJustificationChange(index, value)}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
};

export default SelfEvaluationForm;
