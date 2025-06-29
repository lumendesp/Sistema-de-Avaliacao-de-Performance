import CollaboratorsSearchBar from "../../../components/CollaboratorsSearchBar";
import ReferenceEvaluationForm from "../../../components/ReferenceEvaluationForm/ReferenceEvaluationForm";
import { useState, useEffect } from "react";
import { fetchMyReferences } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import type { Collaborator, Reference } from "../../../types/reference";

const ReferenceEvaluation = () => {
  const [selectedCollaborators, setSelectedCollaborators] = useState<
    Collaborator[]
  >([]); // lista temporária de colaboradores que o usuário está selecionando para avaliar
  const [myReferences, setMyReferences] = useState<Reference[]>([]); // lista de referências já enviadas do usuário logado
  const { user } = useAuth();

  // busca as referências já enviadas do usuário logado
  useEffect(() => {
    if (!user) return;
    fetchMyReferences(1)
      .then(setMyReferences)
      .catch(() => setMyReferences([]));
  }, [user]);

  // adiciona um colaborador à lista temporária (somente se ainda não estiver na lista)
  const handleAddCollaborator = (collaborator: Collaborator) => {
    // Verificar se o colaborador já não foi selecionado
    if (!selectedCollaborators.find((c) => c.id === collaborator.id)) {
      setSelectedCollaborators((prev) => [...prev, collaborator]);
    }
  };

  // remove um colaborador da lista temporária
  const handleRemoveCollaborator = (collaboratorId: number) => {
    setSelectedCollaborators((prev) =>
      prev.filter((c) => c.id !== collaboratorId)
    );
  };

  // pega os IDs dos colaboradores que já receberam referência OU estão selecionados, evitando que o usuário selecione um colaborador que já tenha recebido referência sua ou que já esteja na lista temporária
  const excludeIds = [
    ...myReferences.map((ref) => ref.receiverId),
    ...selectedCollaborators.map((c) => c.id),
  ];

  return (
    <div className="bg-[#f1f1f1] w-full flex flex-col gap-4 p-3 min-h-screen">
      <CollaboratorsSearchBar
        onSelect={handleAddCollaborator}
        excludeIds={excludeIds}
      />
      <ReferenceEvaluationForm
        selectedCollaborators={selectedCollaborators}
        onRemoveCollaborator={handleRemoveCollaborator}
        myReferences={myReferences}
        setMyReferences={setMyReferences}
      />
    </div>
  );
};

export default ReferenceEvaluation;
