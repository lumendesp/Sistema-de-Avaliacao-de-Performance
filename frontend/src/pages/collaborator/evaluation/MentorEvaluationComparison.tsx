import { useEffect, useState } from "react";
import MentorEvaluationForm from "../../../components/MentorEvaluationForm/MentorEvaluationForm";
import { useAuth } from "../../../context/AuthContext";
import { fetchMentorEvaluation, fetchMentors } from "../../../services/api";
import type { MentorEvaluation } from "../../../types/mentor-evaluation";
import type { Mentor } from "../../../types/mentor";
import { useOutletContext } from "react-router-dom";

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

type OutletContextType = {
  selectedCycleId: number | null;
  selectedCycleName: string;
};

export default function MentorEvaluationComparison() {
  const { user, token } = useAuth();
  const { selectedCycleId, selectedCycleName } = useOutletContext<OutletContextType>();

  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [mentorEvaluation, setMentorEvaluation] = useState<MentorEvaluation | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.mentorId || (!selectedCycleId && !selectedCycleName)) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Buscar mentor
        const mentors: Mentor[] = await fetchMentors();
        const foundMentor = mentors.find((m) => m.id === user.mentorId) || null;
        setMentor(foundMentor);

        // Buscar ciclos
        const res = await fetch("http://localhost:3000/ciclos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCycles: Cycle[] = await res.json();

        let selected: Cycle | undefined;
        if (selectedCycleName) {
          selected = allCycles.find((c) => c.name === selectedCycleName);
        } else if (selectedCycleId) {
          const cleanCycleId = typeof selectedCycleId === "string"
            ? parseInt(selectedCycleId.split(":")[0], 10)
            : Number(selectedCycleId);
          selected = allCycles.find((c) => c.id === cleanCycleId);
        }

        if (!selected || !foundMentor) {
          setCycle(null);
          setMentorEvaluation(null);
          return;
        }

        setCycle(selected);

        // Buscar avaliação do mentor
        const evaluation = await fetchMentorEvaluation(foundMentor.id);
        if (evaluation?.cycle?.id === selected.id) {
          setMentorEvaluation(evaluation);
        } else {
          setMentorEvaluation(null);
        }
      } catch (err) {
        console.log("Erro ao carregar mentor ou avaliação:", err);
        setMentor(null);
        setMentorEvaluation(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.mentorId, selectedCycleId, selectedCycleName, token]);

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
          Nenhuma avaliação de mentor encontrada para este ciclo.
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
