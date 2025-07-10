import ScoreBox from "../ScoreBox";
import StarRating from "../StarRating";
import StarRatingReadOnly from "../StarRatingReadOnly";
import type { MentorEvaluationProps } from "../../types/mentor-evaluation";

import { UserIcon } from "../UserIcon";

import { useState, useEffect } from "react";

import { submitMentorEvaluation } from "../../services/api";
import { fetchMentorEvaluation } from "../../services/api";

const MentorEvaluationForm = ({
  evaluateeId,
  mentor,
}: MentorEvaluationProps) => {
  const [score, setScore] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // função auxiliar para pegar as iniciais
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // envia os dados para o backend, verificando se todos os campos estão preenchidos
  const handleSubmit = async () => {
    if (!score || !feedback.trim()) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitMentorEvaluation(evaluateeId, score, feedback);
      setSuccess(true);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // se já tiver avaliação registrada, carrega na tela
  useEffect(() => {
    const loadEvaluation = async () => {
      try {
        const data = await fetchMentorEvaluation(evaluateeId);
        if (data) {
          setScore(data.score);
          setFeedback(data.justification);
          setSuccess(true);
        }
      } catch (err) {
        console.error("Erro ao buscar avaliação existente", err);
      }
    };

    loadEvaluation();
  }, [evaluateeId]);

  // para fazer sumir a mensagem de erro, ao começar a escrever ou ao selecionar as estrelaas
  useEffect(() => {
    if (error && (score || feedback.trim())) {
      setError(null);
    }
  }, [score, feedback]);

  // se já existe uma avaliação ou foi enviada com sucesso, mostra como avaliação enviada, apenas para visualização
  if (success) {
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
            className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm bg-gray-100 text-[#1D1D1D]"
            value={feedback}
            disabled
          ></textarea>
        </div>
      </div>
    );
  }

  // criação de uma nova avaliação
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
          <StarRating
            score={score ?? 0}
            onChange={(newScore) => setScore(newScore)}
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

      {/* botão, que será removido depois */}
      <button
        className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
        disabled={isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
      </button>
    </div>
  );
};

export default MentorEvaluationForm;
