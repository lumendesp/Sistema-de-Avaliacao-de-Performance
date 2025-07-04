import { useEffect, useState } from "react";
import CollaboratorsSearchBar from "../../../components/CollaboratorsSearchBar";
import PeerEvaluationForm from "../../../components/PeerEvaluationForm/PeerEvaluationForm";
import type { Collaborator } from "../../../types/reference";
import type { PeerEvaluation, PeerEvaluationFormData } from "../../../types/peerEvaluation";
import {
  createPeerEvaluation,
  fetchActiveEvaluationCycle,
  fetchMyPeerEvaluations,
} from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useEvaluation } from "../../../context/EvaluationsContext";

const PeerEvaluation = () => {
  const [selectedCollaborators, setSelectedCollaborators] = useState<Collaborator[]>([]);
  const [myEvaluations, setMyEvaluations] = useState<PeerEvaluation[]>([]);
  const [activeCycleId, setActiveCycleId] = useState<number | null>(null);
  const [formData, setFormData] = useState<PeerEvaluationFormData>({});
  const { user } = useAuth();
  const { setSubmitPeerEvaluations } = useEvaluation();

  useEffect(() => {
    const loadActiveCycle = async () => {
      try {
        const cycle = await fetchActiveEvaluationCycle();
        setActiveCycleId(cycle.id);
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

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();

    const emptyForms = selectedCollaborators.filter((c) => {
      const data = formData[c.id];
      return (
        !data?.score ||
        !data?.strengths?.trim() ||
        !data?.improvements?.trim() ||
        !data?.projectName?.trim() ||
        !data?.projectPeriod?.trim() ||
        !data?.motivation
      );
    });

    if (emptyForms.length > 0) {
      alert(
        `Preencha todos os campos obrigatórios para: ${emptyForms
          .map((c) => c.name)
          .join(", ")}`
      );
      return;
    }

    const invalidPeriodForms = selectedCollaborators.filter((c) => {
      const period = formData[c.id]?.projectPeriod;
      return isNaN(Number(period)) || Number(period) <= 0;
    });

    if (invalidPeriodForms.length > 0) {
      alert(
        `O campo de período deve ser um número válido para: ${invalidPeriodForms
          .map((c) => c.name)
          .join(", ")}`
      );
      return;
    }

    try {
      for (const collaborator of selectedCollaborators) {
        const data = formData[collaborator.id];
        const payload = {
          evaluateeId: collaborator.id,
          cycleId: activeCycleId!,
          strengths: data.strengths,
          improvements: data.improvements,
          motivation: data.motivation,
          score: data.score!,
          projects: [
            {
              name: data.projectName,
              period: parseInt(data.projectPeriod),
            },
          ],
        };
        await createPeerEvaluation(payload);
      }

      setFormData({});
      setSelectedCollaborators([]);
      const updated = await fetchMyPeerEvaluations(activeCycleId!);
      setMyEvaluations(updated);

      alert("Avaliações enviadas com sucesso!");
    } catch (err: any) {
      alert(
        err?.response?.data?.message ||
          err.message ||
          "Erro ao enviar uma ou mais avaliações"
      );
    }
  };

  useEffect(() => {
    setSubmitPeerEvaluations(() => () =>
      document.querySelector("form")?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      )
    );

    return () => setSubmitPeerEvaluations(null);
  }, [setSubmitPeerEvaluations]);

  const handleAddCollaborator = (collaborator: Collaborator) => {
    if (!selectedCollaborators.some((c) => c.id === collaborator.id)) {
      setSelectedCollaborators((prev) => [...prev, collaborator]);
    }
  };

  const handleRemoveCollaborator = (collaboratorId: number) => {
    setSelectedCollaborators((prev) =>
      prev.filter((c) => c.id !== collaboratorId)
    );
    setFormData((prev) => {
      const copy = { ...prev };
      delete copy[collaboratorId];
      return copy;
    });
  };

  const excludeIds = [
    ...myEvaluations.map((ev) => ev.evaluateeId),
    ...selectedCollaborators.map((c) => c.id),
  ];

  return (
    <div className="bg-[#f1f1f1] w-full flex flex-col gap-4 p-3 min-h-screen">
      <CollaboratorsSearchBar
        onSelect={handleAddCollaborator}
        excludeIds={excludeIds}
      />
      {selectedCollaborators.length === 0 && myEvaluations.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">
          Selecione um colaborador na barra de busca para começar uma avaliação.
        </p>
      )}

      <PeerEvaluationForm
        selectedCollaborators={selectedCollaborators}
        onRemoveCollaborator={handleRemoveCollaborator}
        myEvaluations={myEvaluations}
        setMyEvaluations={setMyEvaluations}
        cycleId={activeCycleId!}
        onSubmit={handleSubmitAll}
        formData={formData}
        setFormData={setFormData}
      />
    </div>
  );
};

export default PeerEvaluation;
