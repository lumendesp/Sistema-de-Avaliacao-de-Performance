import CollaboratorsSearchBar from "../../../components/CollaboratorsSearchBar";
import PeerEvaluationForm from "../../../components/PeerEvaluationForm/PeerEvaluationForm";
import { useState, useEffect } from "react";
import type { Collaborator } from "../../../types/reference";
import { fetchMyPeerEvaluations } from "../../../services/api";
import type { PeerEvaluation } from "../../../types/peerEvaluation";
import { useAuth } from "../../../context/AuthContext";

const PeerEvaluation = () => {
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    Collaborator[]
  >([]); // lista temporária de colaboradores que o usuário está selecionando para avaliar
  const [myEvaluations, setMyEvaluations] = useState<PeerEvaluation[]>([]); // lista de avaliações já enviadas do usuário logado
  const { user } = useAuth();

  const cycleId = 1; // fixo por enquanto

  // busca as referências já enviadas do usuário logado
  useEffect(() => {
    if (!user) return;

    const loadInitialEvaluations = async () => {
      try {
        const data = await fetchMyPeerEvaluations(cycleId);
        setMyEvaluations(data);
      } catch (err) {
        console.error("Erro ao carregar avaliações:", err);
        setMyEvaluations([]);
      }
    };

    loadInitialEvaluations();
  }, [cycleId, user]); 

  // adiciona um colaborador à lista temporária (somente se ainda não estiver na lista)
  const handleAddCollaborator = (collaborator: Collaborator) => {
    if (!selectedCollaborators.some((c) => c.id === collaborator.id)) {
      setSelectedCollaborators((prev) => [...prev, collaborator]);
    }
  };

  // remove um colaborador da lista temporária
  const handleRemoveCollaborator = (collaboratorId: number) => {
    setSelectedCollaborators((prev) =>
      prev.filter((c) => c.id !== collaboratorId)
    );
  };

  // pega os IDs dos colaboradores que já receberam avaliação OU estão selecionados, evitando que o usuário selecione um colaborador que já tenha recebido avaliação sua ou que já esteja na lista temporária
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
      {myEvaluations.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Selecione um colaborador na barra de busca para começar uma avaliação.
          </p>
      ) : (
        <PeerEvaluationForm
          selectedCollaborators={selectedCollaborators}
          onRemoveCollaborator={handleRemoveCollaborator}
          myEvaluations={myEvaluations}
          setMyEvaluations={setMyEvaluations}
        />
      )}
    </div>
  );
};

export default PeerEvaluation;
