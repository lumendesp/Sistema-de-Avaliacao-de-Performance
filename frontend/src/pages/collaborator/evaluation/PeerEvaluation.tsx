import { useEffect, useState } from "react";
import CollaboratorsSearchBar from "../../../components/CollaboratorsSearchBar";
import PeerEvaluationForm from "../../../components/PeerEvaluationForm/PeerEvaluationForm";
import type { Collaborator } from "../../../types/reference";
import type {
  PeerEvaluation,
} from "../../../types/peerEvaluation";
import {
  findOrCreateEmptyPeerEvaluation,
  fetchActiveEvaluationCycle,
  fetchMyPeerEvaluations,
} from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const PeerEvaluation = () => {
  const [myEvaluations, setMyEvaluations] = useState<PeerEvaluation[]>([]);
  const [activeCycleId, setActiveCycleId] = useState<number | null>(null);
  const [isCycleFinished, setIsCycleFinished] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadActiveCycle = async () => {
      try {
        const cycle = await fetchActiveEvaluationCycle();
        setActiveCycleId(cycle.id);
        setIsCycleFinished(cycle.status === "FINISHED");
      } catch (err) {
        console.error("Erro ao carregar ciclo ativo:", err);
      }
    };

    loadActiveCycle();
  }, []);

  useEffect(() => {
    if (!user || !activeCycleId) return;

    const loadEvaluations = async () => {
      try {
        const data = await fetchMyPeerEvaluations(activeCycleId);
        setMyEvaluations(data);
      } catch (err) {
        console.error("Erro ao carregar avaliações:", err);
        setMyEvaluations([]);
      }
    };

    loadEvaluations();
  }, [user, activeCycleId]);

  const handleAddCollaborator = async (collaborator: Collaborator) => {
    if (!activeCycleId) return;

    // Evita duplicidade se já foi criada
    const alreadyExists = myEvaluations.some(
      (evaluation) => evaluation.evaluateeId === collaborator.id
    );
    if (alreadyExists) return;

    try {
      const newEvaluation = await findOrCreateEmptyPeerEvaluation(
        collaborator.id
      );

      const newEvaluationWithEvaluatee = {
        ...newEvaluation,
        evaluatee: collaborator,
      };

      setMyEvaluations((prev) => [...prev, newEvaluationWithEvaluatee]);
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);
    }
  };

  const excludeIds = myEvaluations.map((evaluation) => evaluation.evaluateeId);

  if (!activeCycleId) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Nenhum ciclo ativo encontrado.
      </p>
    );
  }

  return (
    <div className="bg-[#f1f1f1] min-h-screen w-full flex flex-col gap-4 p-3">
      <CollaboratorsSearchBar
        onSelect={handleAddCollaborator}
        excludeIds={excludeIds}
      />
      <PeerEvaluationForm
        myEvaluations={myEvaluations}
        setMyEvaluations={setMyEvaluations}
        cycleId={activeCycleId!}
        isCycleFinished={isCycleFinished}
      />
    </div>
  );
};

export default PeerEvaluation;
