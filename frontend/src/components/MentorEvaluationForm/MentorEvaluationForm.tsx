import ScoreBox from "../ScoreBox";
import StarRating from "../StarRating";
import StarRatingReadOnly from "../StarRatingReadOnly";
import type {
  MentorEvaluation,
  MentorEvaluationProps,
} from "../../types/mentor-evaluation";
import { UserIcon } from "../UserIcon";

import { useState, useEffect, useRef } from "react";
import { updateMentorEvaluation } from "../../services/api";
import { useEvaluation } from "../../context/EvaluationsContext";

const MentorEvaluationForm = ({
  mentor,
  mentorEvaluation,
  setMentorEvaluation,
  isCycleFinished = false,
}: MentorEvaluationProps) => {
  const [score, setScore] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { updateTabCompletion, isSubmit } = useEvaluation();

  useEffect(() => {
    if (mentorEvaluation) {
      checkIfCompleted(mentorEvaluation);
    }
  }, [mentorEvaluation]);

  // função auxiliar para pegar as iniciais
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Carrega dados da avaliação existente
  useEffect(() => {
    if (mentorEvaluation) {
      setScore(mentorEvaluation.score || undefined);
      setFeedback(mentorEvaluation.justification || "");
    }
  }, [mentorEvaluation]);

  const debouncedSave = (data: { score?: number; justification?: string }) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (!mentorEvaluation?.id) return;

      try {
        const updatedEvaluation = await updateMentorEvaluation(
          mentorEvaluation.id,
          data
        );
        if (setMentorEvaluation) {
          setMentorEvaluation(updatedEvaluation);
          checkIfCompleted(updatedEvaluation);
        }
      } catch (err) {
        console.error("Erro ao salvar avaliação:", err);
        setError("Erro ao salvar avaliação.");
      }
    }, 500);
  };

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    debouncedSave({ score: newScore });
  };

  const handleFeedbackChange = (value: string) => {
    setFeedback(value);
    debouncedSave({ justification: value });
  };

  const checkIfCompleted = async (
    updatedEvaluation: MentorEvaluation | null,
    localScore?: number,
    localFeedback?: string
  ) => {
    setError(null);
    const currentScore = localScore !== undefined ? localScore : score;
    const currentFeedback =
      localFeedback !== undefined ? localFeedback : feedback;

    if (!currentScore || !currentFeedback.trim()) {
      updateTabCompletion("mentor", false);
      setError("Preencha todos os campos");
      return;
    }

    setError(null);

    try {
      if (updatedEvaluation?.id) {
        await updateMentorEvaluation(updatedEvaluation.id, {
          score: currentScore,
          justification: currentFeedback,
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao enviar avaliação";
      setError(errorMessage);
    }

    updateTabCompletion("mentor", true);
  };

  useEffect(() => {
    if (!isCycleFinished && mentorEvaluation) {
      checkIfCompleted(mentorEvaluation, score, feedback);
    }
  }, [score, feedback]);

  useEffect(() => {
    if (error && (score || feedback.trim())) {
      setError(null);
    }
  }, [score, feedback]);

  // Mostra readonly se o ciclo estiver finalizado
  if (isCycleFinished || isSubmit) {
    return (
      <div className="bg-white w-full flex flex-col px-6 py-9 rounded-xl opacity-80">
        <div className="flex justify-between items-center mb-5">
          <div className="flex justify-center items-center gap-3">
            <UserIcon initials={getInitials(mentor.name)} size={40} />
            <div className="flex flex-col">
              <p className="text-sm font-bold ">{mentor.name}</p>
              <p className="text-xs font-normal text-opacity-75 text-[#1D1D1D]">
                {mentor.role ?? "Mentor"}
              </p>
            </div>
          </div>
          <ScoreBox score={score} />
        </div>
        <div className="flex flex-col mb-4 gap-3">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Avaliação enviada
          </p>
          <div>
            <StarRatingReadOnly score={score ?? 0} dimmed={true} />
          </div>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
            Justificativa enviada
          </p>
          <textarea
            className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm bg-gray-100 text-[#1D1D1D] styled-scrollbar"
            value={feedback}
            disabled
          ></textarea>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white w-full flex flex-col px-6 py-9 rounded-xl">
      <div className="flex justify-between items-center mb-5">
        <div className="flex justify-center items-center gap-3">
          <UserIcon initials={getInitials(mentor.name)} size={40} />
          <div className="flex flex-col">
            <p className="text-sm font-bold ">{mentor.name}</p>
            <p className="text-xs font-normal text-opacity-75 text-[#1D1D1D]">
              {mentor.role ?? "Mentor"}
            </p>
          </div>
        </div>
        <ScoreBox score={score} />
      </div>
      <div className="flex flex-col mb-4 gap-3">
        <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
          Dê uma avaliação de 1 a 5 ao colaborador
        </p>
        <div>
          <StarRating score={score ?? 0} onChange={handleScoreChange} />
        </div>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
          Justifique sua nota
        </p>
        <textarea
          className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal styled-scrollbar"
          placeholder="Justifique sua nota..."
          value={feedback}
          onChange={(e) => handleFeedbackChange(e.target.value)}
        ></textarea>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default MentorEvaluationForm;
