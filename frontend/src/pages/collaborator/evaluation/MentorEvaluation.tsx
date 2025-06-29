import MentorEvaluationForm from "../../../components/MentorEvaluationForm/MentorEvaluationForm";
import { useState, useEffect } from "react";

import type { Mentor } from "../../../types/mentor";
import { useAuth } from "../../../context/AuthContext";
import { fetchMentors } from "../../../services/api";

const MentorEvaluation = () => {
  const { user } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.mentorId) {
      setLoading(false);
      return;
    }

    const loadMentor = async () => {
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
  }, [user]);

  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full"></div>;
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
