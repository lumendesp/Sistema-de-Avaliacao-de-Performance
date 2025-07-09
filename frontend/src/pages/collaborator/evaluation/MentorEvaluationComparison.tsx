import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import MentorEvaluationForm from "../../../components/MentorEvaluationForm/MentorEvaluationForm";
import { useAuth } from "../../../context/AuthContext";
import { fetchMentorEvaluation, fetchMentors } from "../../../services/api";
import type { MentorEvaluation } from "../../../types/mentor-evaluation";
import type { Mentor } from "../../../types/mentor";

type OutletContextType = {
  selectedCycleId: number | null;
  selectedCycleName: string;
};

export default function MentorEvaluationComparison() {
  const { selectedCycleId } = useOutletContext<OutletContextType>();
  const { user } = useAuth();
  const [mentorEvaluation, setMentorEvaluation] =
    useState<MentorEvaluation | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMentorAndEvaluation = async () => {
      if (!selectedCycleId || !user?.mentorId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const mentors: Mentor[] = await fetchMentors();
        const foundMentor = mentors.find((m) => m.id === user.mentorId) || null;
        setMentor(foundMentor);
        if (foundMentor) {
          const evaluation = await fetchMentorEvaluation(
            foundMentor.id,
            selectedCycleId
          );
          setMentorEvaluation(evaluation);
        } else {
          setMentorEvaluation(null);
        }
      } catch (err) {
        console.log(err)
        setMentor(null);
        setMentorEvaluation(null);
      } finally {
        setLoading(false);
      }
    };
    loadMentorAndEvaluation();
  }, [selectedCycleId, user]);

  if (!selectedCycleId)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-start">
          Selecione um ciclo para visualizar sua avaliação de mentor anterior.
        </p>
      </div>
    );

  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full" />;

  if (!mentor)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">
          Você não tem um mentor atribuído ainda.
        </p>
      </div>
    );

  if (!mentorEvaluation)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">
          Nenhuma avaliação de mentor para este ciclo.
        </p>
      </div>
    );

  return (
    <div className="p-3 bg-[#f1f1f1] space-y-6">
      <MentorEvaluationForm
        evaluateeId={mentor.id}
        mentor={mentor}
        mentorEvaluation={mentorEvaluation}
        setMentorEvaluation={() => {}}
        cycleId={selectedCycleId}
        isCycleFinished={true}
      />
    </div>
  );
}
