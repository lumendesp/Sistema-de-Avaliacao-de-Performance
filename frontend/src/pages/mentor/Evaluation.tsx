import { useEffect, useState } from "react";
import MentorToCollaboratorEvaluationForm from "../../components/Mentor/MentorToCollaboratorEvaluationForm";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchActiveEvaluationCycle } from "../../services/api";

export default function MentorEvaluationPage() {
  const { id: collaboratorId } = useParams();
  const { user } = useAuth();
  const [cycleId, setCycleId] = useState<number | null>(null);
  const [cycleStatus, setCycleStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCycle = async () => {
      setLoading(true);
      try {
        const cycle = await fetchActiveEvaluationCycle("MANAGER");
        setCycleId(cycle.id);
        setCycleStatus(cycle.status || null);
      } catch {
        setCycleId(null);
        setCycleStatus(null);
      } finally {
        setLoading(false);
      }
    };
    loadCycle();
  }, []);

  if (!collaboratorId)
    return (
      <div className="text-red-500 text-center mt-10 font-semibold bg-red-100 border border-red-300 rounded p-4 max-w-xl mx-auto">
        Colaborador não encontrado.
      </div>
    );
  if (loading)
    return <div className="text-gray-500 text-center mt-10">Carregando...</div>;
  if (!cycleId || cycleStatus !== "IN_PROGRESS_MANAGER")
    return (
      <div className="text-red-500 text-center mt-10 font-semibold bg-red-100 border border-red-300 rounded p-4 max-w-xl mx-auto">
        Nenhum ciclo de avaliação de mentor em andamento.
        <br />
        <span className="text-gray-700 text-sm font-normal">
          A avaliação de mentor só estará disponível durante o ciclo de
          avaliação do mentor.
        </span>
      </div>
    );
  if (!user)
    return (
      <div className="text-red-500 text-center mt-10 font-semibold bg-red-100 border border-red-300 rounded p-4 max-w-xl mx-auto">
        Usuário não autenticado.
      </div>
    );

  // Adapta o user para o formato Mentor esperado
  const mentorObj = {
    id: user.id,
    name: user.name,
    role: user.roles?.includes("MENTOR") ? "Mentor" : undefined,
  };

  // DEBUG: Mostra sempre algo na tela para garantir renderização
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center gap-8">
      <MentorToCollaboratorEvaluationForm
        evaluateeId={Number(collaboratorId)}
        mentor={mentorObj}
        cycleId={cycleId}
      />
    </div>
  );
}
