import { useEffect, useState } from "react";
import MentorEvaluationForm from "../../../components/MentorEvaluationForm/MentorEvaluationForm";
import { useAuth } from "../../../context/AuthContext";
import { fetchMentorEvaluation, fetchMentors } from "../../../services/api";
import type { MentorEvaluation } from "../../../types/mentor-evaluation";
import type { Mentor } from "../../../types/mentor";

interface Cycle {
  id: number;
  name: string;
  status:
    | "IN_PROGRESS_COLLABORATOR"
    | "IN_PROGRESS_MANAGER"
    | "IN_PROGRESS_COMMITTEE"
    | "CLOSED"
    | "PUBLISHED";
}

export default function MentorEvaluationComparison() {
  const { user, token } = useAuth();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [mentorEvaluation, setMentorEvaluation] = useState<MentorEvaluation | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMentorAndEvaluation = async () => {
      if (!user?.mentorId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Buscar mentor
        const mentors: Mentor[] = await fetchMentors();
        const foundMentor = mentors.find((m) => m.id === user.mentorId) || null;
        setMentor(foundMentor);

        // Buscar avaliação primeiro
        if (foundMentor) {
          const evaluation = await fetchMentorEvaluation(foundMentor.id);
          setMentorEvaluation(evaluation);

          // Buscar ciclo correspondente
          if (evaluation?.cycle?.id) {
            const res = await fetch("http://localhost:3000/ciclos", {
              headers: { Authorization: `Bearer ${token}` },
            });
            const allCycles: Cycle[] = await res.json();
            const foundCycle = allCycles.find((c) => c.id === evaluation.cycle.id) || null;
            setCycle(foundCycle);
          }
        } else {
          setMentorEvaluation(null);
        }
      } catch (err) {
        console.log(err);
        setMentor(null);
        setMentorEvaluation(null);
      } finally {
        setLoading(false);
      }
    };

    loadMentorAndEvaluation();
  }, [user, token]);

  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full" />;

  if (!mentor)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full py-8 flex justify-center">
        <p className="text-sm text-gray-400 text-center">
          Você não tinha um mentor atribuído nesse ciclo.
        </p>
      </div>
    );

  if (!mentorEvaluation || !cycle)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full py-8 flex justify-center">
        <p className="text-sm text-gray-400 text-center">
          Nenhuma avaliação de mentor encontrada.
        </p>
      </div>
    );

  return (
    <div className="p-3 bg-[#f1f1f1] space-y-6 min-h-screen">
      <MentorEvaluationForm
        evaluateeId={mentor.id}
        mentor={mentor}
        mentorEvaluation={mentorEvaluation}
        setMentorEvaluation={() => {}}
        cycleId={cycle.id}
        isCycleFinished={true}
      />
    </div>
  );
}
