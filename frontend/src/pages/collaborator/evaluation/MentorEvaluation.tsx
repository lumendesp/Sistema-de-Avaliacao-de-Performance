import MentorEvaluationForm from "../../../components/MentorEvaluationForm/MentorEvaluationForm";
import { useState, useEffect } from "react";

import type { Mentor } from "../../../types/mentor";
import { useAuth } from "../../../context/AuthContext";
import { useEvaluation } from "../../../context/EvaluationsContext";
import {
  fetchMentors,
  fetchActiveEvaluationCycle,
  findOrCreateEmptyMentorEvaluation,
} from "../../../services/api";

const MentorEvaluation = () => {
  const { user } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCycleId, setActiveCycleId] = useState<number | null>(null);
  const [mentorEvaluation, setMentorEvaluation] = useState<any>(null);
  const [isCycleFinished, setIsCycleFinished] = useState(false);

  const { updateTabCompletion } = useEvaluation();

  // Se não existe mentor, marca a tab como completa
  useEffect(() => {
    if (!mentor) {
      updateTabCompletion("mentor", true);
    }
  }, [mentor]);

  useEffect(() => {
    const loadActiveCycle = async () => {
      try {
        const cycle = await fetchActiveEvaluationCycle();
        setActiveCycleId(cycle.id);
        setIsCycleFinished(cycle.status === "FINISHED");
      } catch (err) {
        console.error("Erro ao carregar ciclo ativo:", err);
        setActiveCycleId(null);
      }
    };

    loadActiveCycle();
  }, []); // só uma vez no início

  useEffect(() => {
    const loadMentorAndEvaluation = async () => {
      if (!user || !user.mentorId || !activeCycleId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const mentors: Mentor[] = await fetchMentors();
        const foundMentor = mentors.find((m) => m.id === user.mentorId) || null;
        setMentor(foundMentor);

        if (foundMentor) {
          // Busca ou cria uma avaliação vazia
          const evaluation = await findOrCreateEmptyMentorEvaluation(
            foundMentor.id
          );
          setMentorEvaluation(evaluation);
        }
      } catch (err) {
        console.error("Erro ao carregar mentor ou avaliação:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMentorAndEvaluation();
  }, [user, activeCycleId]);

  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full"></div>;

  if (!activeCycleId) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Nenhum ciclo ativo encontrado.
      </p>
    );
  }

  if (!mentor) {
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3">
        <p className="text-sm text-gray-400 text-center py-8">
          Você não tem um mentor atribuído ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#f1f1f1] h-screen w-full p-3">
      <MentorEvaluationForm
        evaluateeId={mentor.id}
        mentor={mentor}
        mentorEvaluation={mentorEvaluation}
        setMentorEvaluation={setMentorEvaluation}
        cycleId={activeCycleId}
        isCycleFinished={isCycleFinished}
      />
    </div>
  );
};

export default MentorEvaluation;
