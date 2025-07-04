import { UserIcon } from "../UserIcon";
import { FaTrash } from "react-icons/fa";

import { useEffect, useState } from "react";
import { createReference, fetchMyReferences } from "../../services/api";
import type { ReferenceEvaluationFormProps } from "../../types/reference";
import { useEvaluation } from "../../context/EvaluationsContext";

const ReferenceEvaluationForm = ({
  selectedCollaborators,
  onRemoveCollaborator,
  myReferences,
  setMyReferences,
  cycleId
}: ReferenceEvaluationFormProps) => {
  const [formData, setFormData] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { registerSubmitHandler } = useEvaluation();

  useEffect(() => {
    registerSubmitHandler("reference-evaluation", handleSubmitAll);
  }, [formData, selectedCollaborators]);

  const handleInputChange = (collaboratorId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [collaboratorId]: value,
    }));
  };

  const handleSubmitAll = async () => {
    const emptyForms = selectedCollaborators.filter(
      (c) => !formData[c.id]?.trim()
    );
    if (emptyForms.length > 0) {
      setError(
        `Preencha o feedback para: ${emptyForms.map((c) => c.name).join(", ")}`
      );
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    const collaboratorsToRemove = [...selectedCollaborators];
    collaboratorsToRemove.forEach((c) => onRemoveCollaborator(c.id));
    setFormData({});

    try {
      const promises = selectedCollaborators.map((collaborator) =>
        createReference(collaborator.id, cycleId, formData[collaborator.id])
      );
      await Promise.all(promises);

      setSuccess(true);
      const updatedRefs = await fetchMyReferences(cycleId);
      setMyReferences(updatedRefs);
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
      {myReferences.length > 0 ? (
        <div className="flex flex-col gap-4">
          {myReferences.map((ref, idx) => (
            <div
              key={idx}
              className="bg-white w-full flex flex-col px-6 py-9 rounded-xl opacity-80"
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex justify-center items-center gap-3">
                    <UserIcon
                      initials={getInitials(ref.receiver?.name || "")}
                      size={40}
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-bold ">
                        {ref.receiver?.name || ref.receiverId}
                      </p>
                      <p className="text-xs font-normal text-opacity-75 text-[#1D1D1D]">
                        {ref.receiver?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                    Justificativa enviada
                  </p>
                  <textarea
                    className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm bg-gray-100 text-[#1D1D1D]"
                    value={ref.justification || ref.feedback}
                    disabled
                  ></textarea>
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

      {selectedCollaborators.length > 0 && (
        <form className="flex flex-col gap-4">
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
                  className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
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
          {error && <p className="text-red-500 text-xs">{error}</p>}
          {success && (
            <p className="text-green-600 text-xs">
              Referências enviadas com sucesso!
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default ReferenceEvaluationForm;
