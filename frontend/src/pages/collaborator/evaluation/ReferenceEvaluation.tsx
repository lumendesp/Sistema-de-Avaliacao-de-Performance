import CollaboratorsSearchBar from "../../../components/CollaboratorsSearchBar";
import ReferenceEvaluationForm from "../../../components/ReferenceEvaluationForm/ReferenceEvaluationForm";
import { useState, useEffect } from "react";
import {
  fetchMyReferences,
  fetchActiveEvaluationCycle,
  createReference,
} from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import type { Collaborator, Reference } from "../../../types/reference";

const ReferenceEvaluation = () => {
  // const [selectedCollaborators, setSelectedCollaborators] = useState<
  //   Collaborator[]
  // >([]); // lista temporária de colaboradores que o usuário está selecionando para avaliar
  const [myReferences, setMyReferences] = useState<Reference[]>([]); // lista de referências já enviadas do usuário logado
  const [activeCycleId, setActiveCycleId] = useState<number | null>(null);
  const { user } = useAuth();

  // busca as referências já enviadas do usuário logado
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
        const data = await fetchMyReferences(activeCycleId);
        setMyReferences(data);
      } catch (err) {
        console.error("Erro ao carregar avaliações:", err);
        setMyReferences([]);
      }
    };

    loadEvaluations();
  }, [user, activeCycleId]);

  // adiciona um colaborador à lista temporária (somente se ainda não estiver na lista)
  const handleAddCollaborator = async (collaborator: Collaborator) => {
    if (!activeCycleId) return;

    // Evita duplicidade se já foi criada
    const alreadyExists = myReferences.some(
      (ref) => ref.receiverId === collaborator.id
    );
    if (alreadyExists) return;

    try {
      const newReference = await createReference(
        collaborator.id,
        activeCycleId,
        ""
      );

      const newReferenceWithReceiver = {
        ...newReference,
        receiver: collaborator,
      };

      setMyReferences((prev) => [...prev, newReferenceWithReceiver]);
    } catch (error) {
      console.error("Erro ao criar referência:", error);
    }
  };

  const excludeIds = myReferences.map((ref) => ref.receiverId);

  if (!activeCycleId) {
    return (
      <p className="text-center text-gray-500 mt-10">
        Nenhum ciclo ativo encontrado.
      </p>
    );
  }

  return (
    <div className="bg-[#f1f1f1] w-full flex flex-col gap-4 p-3 min-h-screen">
      <CollaboratorsSearchBar
        onSelect={handleAddCollaborator}
        excludeIds={excludeIds}
      />
      <ReferenceEvaluationForm
        myReferences={myReferences}
        setMyReferences={setMyReferences}
        cycleId={activeCycleId!}
      />
    </div>
  );
};

export default ReferenceEvaluation;
