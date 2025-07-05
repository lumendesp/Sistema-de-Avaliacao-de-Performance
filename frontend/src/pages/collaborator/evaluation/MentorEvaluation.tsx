import MentorEvaluationForm from "../../../components/MentorEvaluationForm/MentorEvaluationForm";
import { useState, useEffect } from "react";

import type { Mentor } from "../../../types/mentor";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchMentors,
  fetchActiveEvaluationCycle,
} from "../../../services/api";

const MentorEvaluation = () => {
  const { user } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCycleId, setActiveCycleId] = useState<number | null>(null);

  useEffect(() => {
    const loadActiveCycle = async () => {
      try {
        const cycle = await fetchActiveEvaluationCycle();
        setActiveCycleId(cycle.id);
      } catch (err) {
        console.error("Erro ao carregar ciclo ativo:", err);
        setActiveCycleId(null);
      }
    };

    loadActiveCycle();
  }, []); // só uma vez no início

  useEffect(() => {
    const loadMentor = async () => {
      if (!user || !user.mentorId || !activeCycleId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const mentors: Mentor[] = await fetchMentors();
        const foundMentor = mentors.find((m) => m.id === user.mentorId) || null;
        setMentor(foundMentor);
      } catch (err) {
        console.error("Erro ao carregar mentor:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMentor();
  }, [user, activeCycleId]);

  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full"></div>;

  if (!activeCycleId) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Nenhum ciclo ativo encontrado.
      </p>
    );
  }

  if (!mentor)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3">
        <p className="text-sm text-gray-400 text-center py-8">
          Você não tem um mentor atribuído ainda.
        </p>
      </div>
    );

  return (
    <div className="bg-[#f1f1f1] h-screen w-full p-3">
      <MentorEvaluationForm evaluateeId={mentor.id} mentor={mentor} />
    </div>
  );
};

export default MentorEvaluation;
