import { useEffect, useState } from "react";
import CollaboratorsSearchBar from "../../../components/CollaboratorsSearchBar";
import PeerEvaluationForm from "../../../components/PeerEvaluationForm/PeerEvaluationForm";
import type { Collaborator } from "../../../types/reference";
import type { PeerEvaluation } from "../../../types/peerEvaluation";
import {
  findOrCreateEmptyPeerEvaluation,
  fetchActiveEvaluationCycle,
  fetchMyPeerEvaluations,
} from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useEvaluation } from "../../../context/EvaluationsContext";
import PeerEvaluationReadOnlyForm from "../../../components/PeerEvaluationForm/PeerEvaluationReadOnlyForm";

const PeerEvaluation = () => {
  const motivationLabels: Record<string, string> = {
    CONCORDO_TOTALMENTE: "Concordo totalmente",
    CONCORDO_PARCIALMENTE: "Concordo parcialmente",
    DISCORDO_PARCIALMENTE: "Discordo parcialmente",
    DISCORDO_TOTALMENTE: "Discordo totalmente",
  };

  const [myEvaluations, setMyEvaluations] = useState<PeerEvaluation[]>([]);
  const [activeCycleId, setActiveCycleId] = useState<number | null>(null);
  const [isCycleFinished, setIsCycleFinished] = useState(false);
  const { user } = useAuth();
  const { isSubmit } = useEvaluation();

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
      {isSubmit ? (
        myEvaluations.map((evaluation) => (
          <PeerEvaluationReadOnlyForm
            key={evaluation.id}
            collaboratorName={evaluation.evaluatee?.name || "Sem nome"}
            collaboratorEmail={evaluation.evaluatee?.email || "Sem e-mail"}
            initials={
              evaluation.evaluatee?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "??"
            }
            score={evaluation.score ?? 0}
            strengths={evaluation.strengths || ""}
            improvements={evaluation.improvements || ""}
            motivationLabel={
              motivationLabels[evaluation.motivation] || "Não informado"
            }
            projects={
              evaluation.projects?.length
                ? evaluation.projects.map((p) => ({
                    name: p.project?.name || "",
                    period: p.period || 0,
                  }))
                : [
                    {
                      name: evaluation.projects?.[0]?.project?.name || "",
                      period: evaluation.projects?.[0]?.period || 0,
                    },
                  ]
            }
          />
        ))
      ) : (
        <PeerEvaluationForm
          myEvaluations={myEvaluations}
          setMyEvaluations={setMyEvaluations}
          cycleId={activeCycleId}
          isCycleFinished={isCycleFinished}
        />
      )}
    </div>
  );
};

export default PeerEvaluation;
