import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PeerEvaluationReadOnlyFormNoHeader from "../../components/PeerEvaluationForm/PeerEvaluationReadOnlyFormNoHeader";
import {
  fetchActiveEvaluationCycle,
  fetchPeerEvaluationsReceived,
} from "../../services/api";
import type { PeerEvaluation as PeerEvaluationType } from "../../types/peerEvaluation";

const motivationLabels: Record<string, string> = {
  CONCORDO_TOTALMENTE: "Concordo Totalmente",
  CONCORDO_PARCIALMENTE: "Concordo Parcialmente",
  DISCORDO_PARCIALMENTE: "Discordo Parcialmente",
  DISCORDO_TOTALMENTE: "Discordo Totalmente",
};

const PeerEvaluationMentor = () => {
  const { id } = useParams();
  const [peerEvaluations, setPeerEvaluations] = useState<PeerEvaluationType[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [cycleId, setCycleId] = useState<number | null>(null);
  const collaboratorId = id ? Number(id) : null;

  useEffect(() => {
    const loadCycle = async () => {
      try {
        setLoading(true);
        const cycle = await fetchActiveEvaluationCycle("MANAGER");
        setCycleId(cycle.id);
      } catch {
        setCycleId(null);
      } finally {
        setLoading(false);
      }
    };
    loadCycle();
  }, []);

  useEffect(() => {
    if (!collaboratorId || !cycleId) return;
    setLoading(true);
    fetchPeerEvaluationsReceived(cycleId, collaboratorId)
      .then(setPeerEvaluations)
      .catch(() => setPeerEvaluations([]))
      .finally(() => setLoading(false));
  }, [collaboratorId, cycleId]);

  if (loading)
    return (
      <div className="text-gray-500 text-center mt-10">
        Carregando avaliações 360...
      </div>
    );
  if (!cycleId)
    return (
      <div className="text-red-500 text-center mt-10 font-semibold bg-red-100 border border-red-300 rounded p-4 max-w-xl mx-auto">
        Nenhum ciclo de avaliação de gestor em andamento.
        <br />
        <span className="text-gray-700 text-sm font-normal">
          As avaliações 360 deste colaborador só estarão disponíveis durante o
          ciclo de avaliação do gestor.
        </span>
      </div>
    );

  return (
    <div className="bg-[#f1f1f1] min-h-screen w-full flex flex-col gap-4 p-3">
      {!loading && peerEvaluations.length === 0 && (
        <div className="text-gray-500 text-center mt-10 font-semibold bg-yellow-100 border border-yellow-300 rounded p-4 max-w-xl mx-auto">
          Nenhuma avaliação 360 encontrada para este colaborador.
        </div>
      )}
      {!loading &&
        peerEvaluations.map((evaluation, idx) => (
          <PeerEvaluationReadOnlyFormNoHeader
            key={evaluation.id || idx}
            score={evaluation.score}
            strengths={evaluation.strengths}
            improvements={evaluation.improvements}
            motivationLabel={
              motivationLabels[evaluation.motivation] || evaluation.motivation
            }
            projects={evaluation.projects?.map((p) => ({
              name: p.project?.name || "",
              period: p.period ?? 0,
            }))}
          />
        ))}
    </div>
  );
};

export default PeerEvaluationMentor;
