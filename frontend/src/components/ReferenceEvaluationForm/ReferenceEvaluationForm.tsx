import { UserIcon } from "../UserIcon";
import { FaTrash } from "react-icons/fa";

import { useEffect, useState, useRef } from "react";
import {
  updateReference,
  fetchMyReferences,
  deleteReference,
} from "../../services/api";
import type { ReferenceEvaluationFormProps } from "../../types/reference";
import { useEvaluation } from "../../context/EvaluationsContext";

const ReferenceEvaluationForm = ({
  myReferences,
  setMyReferences,
  cycleId,
  isCycleFinished,
}: ReferenceEvaluationFormProps) => {
  const [formData, setFormData] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { updateTabCompletion, isSubmit } = useEvaluation();

  useEffect(() => {
    if (myReferences) {
      checkIfCompleted(myReferences);
    }
  }, [formData, myReferences]);

  const debouncedSave = (referenceId: number, value: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const updated = await updateReference(referenceId, value);

        const updatedReferences = myReferences.map((ref) =>
          ref.id === referenceId ? { ...ref, ...updated } : ref
        );

        setMyReferences(updatedReferences);
        checkIfCompleted(updatedReferences);
      } catch (err) {
        console.error("Erro ao salvar justificativa:", err);
        setError("Erro ao salvar justificativa.");
      }
    }, 500);
  };

  const handleInputChange = (referenceId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [referenceId]: value,
    }));

    debouncedSave(referenceId, value);
  };

  const handleRemoveReference = async (referenceId: number) => {
    try {
      await deleteReference(referenceId); // chamada para remover no backend
      setMyReferences((prev) => prev.filter((r) => r.id !== referenceId)); // atualiza front
    } catch (err) {
      console.error("Erro ao remover referência:", err);
      setError("Erro ao remover colaborador.");
    }
  };

  const checkIfCompleted = (references: any[]) => {
    setError(null);

    // Verifica se alguma referência (localmente ou no backend) está sem justificativa
    const hasEmpty = references.some((ref) => {
      const localJustification = formData[ref.id];
      const justification =
        localJustification !== undefined
          ? localJustification
          : ref.justification ?? "";

      return !justification?.trim();
    });

    updateTabCompletion("reference", !hasEmpty);
  };

  const savePendingReferences = async (references: any[]) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const refsToSend = references.filter((ref) => !ref.justification?.trim());

    // Também pode garantir aqui que formData[ref.id] está preenchido, se quiser

    try {
      const promises = refsToSend.map((ref) =>
        updateReference(ref.id, formData[ref.id])
      );
      await Promise.all(promises);

      setSuccess(true);

      const updatedRefs = await fetchMyReferences(cycleId);
      setMyReferences(updatedRefs);

      checkIfCompleted(updatedRefs); // atualiza completude após salvar
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao enviar referências";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {isCycleFinished || isSubmit ? (
        // Mostrar só referências já enviadas, todas readonly
        <>
          {myReferences.length > 0 ? (
            myReferences.map((ref) => (
              <div
                key={ref.id}
                className="bg-white w-full flex flex-col px-6 py-9 rounded-xl opacity-80"
              >
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <UserIcon
                      initials={getInitials(ref.receiver?.name || "")}
                      size={40}
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-bold">
                        {ref.receiver?.name || ref.receiverId}
                      </p>
                      <p className="text-xs text-[#1D1D1D] text-opacity-75">
                        {ref.receiver?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-xs text-[#1D1D1D] text-opacity-75">
                    Justificativa enviada
                  </p>
                  <textarea
                    className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm bg-gray-100 text-[#1D1D1D] styled-scrollbar"
                    value={ref.justification || ref.feedback}
                    disabled
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : selectedCollaborators.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Você não adicionou nenhuma referência ainda.
        </p>
      ) : null}

      {/* permite selecionar vários colaboradores e enviar de uma só vez */}
      {selectedCollaborators.length > 0 && (
        <form onSubmit={handleSubmitAll} className="flex flex-col gap-4">
          {selectedCollaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="bg-white w-full flex flex-col px-6 py-9 rounded-xl"
            >
              <div className="flex justify-between items-center mb-5">
                <div className="flex justify-center items-center gap-3">
                  <UserIcon
                    initials={getInitials(collaborator.name)}
                    size={40}
                  />
                  <div className="flex flex-col">
                    <p className="text-sm font-bold ">{collaborator.name}</p>
                    <p className="text-xs font-normal text-opacity-75 text-[#1D1D1D]">
                      {collaborator.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCollaborator(collaborator.id)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTrash className="text-[#F33E3E]" />
                </button>
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                  Justifique sua nota
                </p>
                <textarea
                  className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal styled-scrollbar"
                  placeholder="Justifique sua nota..."
                  value={formData[collaborator.id] || ""}
                  onChange={(e) =>
                    handleInputChange(collaborator.id, e.target.value)
                  }
                  required
                ></textarea>
              </div>
            </div>
          ))}

          {/* botão de envio (depois vai ser removido) */}
          <button
            type="submit"
            className="bg-[#08605E] text-white rounded px-4 py-2 mt-2 disabled:opacity-50 w-full"
            disabled={loading}
          >
            {loading
              ? "Enviando..."
              : `Enviar ${selectedCollaborators.length} referência${
                  selectedCollaborators.length > 1 ? "s" : ""
                }`}
          </button>

          {error && <p className="text-red-500 text-xs">{error}</p>}
          {success && (
            <p className="text-green-600 text-xs">
              Referências enviadas com sucesso!
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default ReferenceEvaluationForm;
