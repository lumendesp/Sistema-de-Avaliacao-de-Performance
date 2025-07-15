import StarRating from "../StarRating";
import type { MentorEvaluationProps } from "../../types/mentor-evaluation";

import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  createMentorToCollaboratorEvaluation,
  fetchMentorToCollaboratorEvaluations,
} from "../../services/api";

const MentorToCollaboratorEvaluationForm = ({
  evaluateeId,
  mentor,
  cycleId,
}: MentorEvaluationProps & { cycleId: number }) => {
  const [score, setScore] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { setSubmit } = useOutletContext<{
    setSubmit: (fn: () => Promise<boolean>, isUpdate: boolean) => void;
  }>();

  useEffect(() => {
    // Busca avaliação já enviada deste mentor para este colaborador neste ciclo
    const loadEvaluation = async () => {
      try {
        const data = await fetchMentorToCollaboratorEvaluations(mentor.id);
        // Busca avaliação para o colaborador atual e ciclo
        const found = (data || []).find(
          (ev: { evaluateeId: number; cycleId: number }) =>
            ev.evaluateeId === evaluateeId && ev.cycleId === cycleId
        );
        if (found) {
          setScore(found.score);
          setFeedback(found.justification);
        } else {
          setScore(undefined);
          setFeedback("");
        }
      } catch (err) {
        console.error("Erro ao buscar avaliação existente", err);
      }
    };
    loadEvaluation();
  }, [evaluateeId, mentor.id, cycleId]);

  const handleSubmit = async () => {
    if (!score || !feedback.trim()) {
      setError("Preencha todos os campos");
      return false;
    }
    try {
      await createMentorToCollaboratorEvaluation({
        evaluateeId,
        cycleId,
        score,
        justification: feedback,
      });
      setError(null);
      return true;
    } catch (err) {
      // Mostra o erro no console para depuração
      console.error("Erro ao enviar avaliação:", err);
      setError(err instanceof Error ? err.message : "Erro ao enviar avaliação");
      return false;
    }
  };

  useEffect(() => {
    setSubmit(handleSubmit, false); // false = não é update, ajuste se necessário
  }, [handleSubmit, setSubmit]);

  useEffect(() => {
    if (error && (score || feedback.trim())) {
      setError(null);
    }
  }, [score, feedback, error]);

  // Sempre mostrar o formulário de edição, mesmo se já houver avaliação enviada
  return (
    <div className="bg-white w-full flex flex-col px-6 py-9 rounded-xl">
      <div className="flex flex-col mb-4 gap-3">
        <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
          Dê uma avaliação de 1 a 5 ao colaborador
        </p>
        <div>
          <StarRating
            score={score ?? 0}
            onChange={(newScore: number) => setScore(newScore)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
          Justifique sua nota
        </p>
        <textarea
          className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
          placeholder="Justifique sua nota..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        ></textarea>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default MentorToCollaboratorEvaluationForm;
