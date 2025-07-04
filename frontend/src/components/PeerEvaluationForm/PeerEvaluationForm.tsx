import { UserIcon } from "../UserIcon";
import { FaTrash } from "react-icons/fa";
import StarRating from "../StarRating";

import Select from "react-select";
import {
  fetchMyPeerEvaluations,
} from "../../services/api";
import type { Collaborator } from "../../types/reference";
import type { PeerEvaluation, PeerEvaluationFormData } from "../../types/peerEvaluation";

import PeerEvaluationReadOnlyForm from "./PeerEvaluationReadOnlyForm";

type MotivationOption = {
  value: string;
  label: string;
};

interface PeerEvaluationFormProps {
  selectedCollaborators: Collaborator[];
  onRemoveCollaborator: (collaboratorId: number) => void;
  myEvaluations: PeerEvaluation[];
  setMyEvaluations: (evaluations: PeerEvaluation[]) => void;
  cycleId: number;
  onSubmit: (e: React.FormEvent) => void;
  formData: PeerEvaluationFormData;
  setFormData: React.Dispatch<React.SetStateAction<PeerEvaluationFormData>>;
}

const PeerEvaluationForm = ({
  selectedCollaborators,
  onRemoveCollaborator,
  myEvaluations,
  setMyEvaluations,
  cycleId,
  onSubmit,
  formData,
  setFormData,
}: PeerEvaluationFormProps) => {
  const motivationOptions: MotivationOption[] = [
    { value: "CONCORDO_TOTALMENTE", label: "Concordo Totalmente" },
    { value: "CONCORDO_PARCIALMENTE", label: "Concordo Parcialmente" },
    { value: "DISCORDO_PARCIALMENTE", label: "Discordo Parcialmente" },
    { value: "DISCORDO_TOTALMENTE", label: "Discordo Totalmente" },
  ];

  const handleInputChange = (
    collaboratorId: number,
    field: keyof (typeof formData)[number],
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [collaboratorId]: {
        ...prev[collaboratorId],
        [field]: value,
      },
    }));
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="flex flex-col gap-4 w-full">
      {myEvaluations.length > 0 && (
        <div className="flex flex-col gap-4">
          {myEvaluations.map((evaluation) => (
            <PeerEvaluationReadOnlyForm
              key={evaluation.evaluatee.id}
              collaboratorName={evaluation.evaluatee.name}
              collaboratorEmail={evaluation.evaluatee.email}
              initials={getInitials(evaluation.evaluatee.name)}
              score={evaluation.score}
              strengths={evaluation.strengths}
              improvements={evaluation.improvements}
              motivationLabel={
                motivationOptions.find(
                  (opt) => opt.value === evaluation.motivation
                )?.label || evaluation.motivation
              }
              projects={evaluation.projects.map((p) => ({
                name: p.project.name,
                period: p.period,
              }))}
            />
          ))}
        </div>
      )}

      {selectedCollaborators.length > 0 && (
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {selectedCollaborators.map((collaborator) => {
            const data = formData[collaborator.id] || {
              score: undefined,
              strengths: "",
              improvements: "",
              motivation: "",
              projectName: "",
              projectPeriod: "",
            };

            return (
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
                      <p className="text-sm font-bold">{collaborator.name}</p>
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

                <div className="flex flex-col mb-4 gap-3">
                  <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                    Dê uma avaliação de 1 a 5 ao colaborador
                  </p>
                  <div>
                    <StarRating
                      score={data.score ?? 0}
                      onChange={(score) =>
                        handleInputChange(collaborator.id, "score", score)
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                      Pontos fortes
                    </p>
                    <textarea
                      className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
                      placeholder="Justifique sua nota..."
                      value={data.strengths}
                      onChange={(e) =>
                        handleInputChange(
                          collaborator.id,
                          "strengths",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                      Pontos de melhoria
                    </p>
                    <textarea
                      className="w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
                      placeholder="Justifique sua nota..."
                      value={data.improvements}
                      onChange={(e) =>
                        handleInputChange(
                          collaborator.id,
                          "improvements",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                      Projeto em que atuaram juntos (obrigatório terem atuado juntos)
                    </p>
                    <input
                      type="text"
                      className="w-full h-9 p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
                      placeholder="Nome do Projeto"
                      value={data.projectName}
                      onChange={(e) =>
                        handleInputChange(
                          collaborator.id,
                          "projectName",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                      Você ficaria motivado em trabalhar novamente com este colaborador?
                    </p>
                    <Select
                      options={motivationOptions}
                      value={
                        motivationOptions.find(
                          (opt) => opt.value === data.motivation
                        ) || null
                      }
                      onChange={(selected) =>
                        handleInputChange(
                          collaborator.id,
                          "motivation",
                          selected ? selected.value : ""
                        )
                      }
                      placeholder="Selecione uma opção"
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          minHeight: "36px",
                          height: "36px",
                          borderRadius: "0.25rem",
                          borderColor: state.isFocused ? "#08605e4a" : "#ccc",
                          boxShadow: "none",
                          outline: state.isFocused
                            ? "1px solid #08605e4a"
                            : "none",
                          fontSize: "12px",
                          padding: 0,
                          "&:hover": {
                            borderColor: state.isFocused ? "#08605e4a" : "#ccc",
                            boxShadow: "none",
                            outline: state.isFocused
                              ? "1px solid #08605e4a"
                              : "none",
                          },
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isFocused
                            ? "#08605e4a"
                            : "white",
                          color: "#1D1D1D",
                          cursor: "pointer",
                          ":active": {
                            backgroundColor: "#08605e4a",
                          },
                        }),
                        valueContainer: (base) => ({
                          ...base,
                          padding: "0 8px",
                        }),
                        indicatorsContainer: (base) => ({
                          ...base,
                          height: "36px",
                        }),
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                      Período (em meses)
                    </p>
                    <input
                      type="text"
                      className="w-full max-w-40 h-9 p-2 rounded border border-gray-300 text-sm focus:outline-[#08605e4a] placeholder:text-[#94A3B8] placeholder:text-xs placeholder:font-normal"
                      placeholder="Insira apenas o número"
                      value={data.projectPeriod}
                      onChange={(e) =>
                        handleInputChange(
                          collaborator.id,
                          "projectPeriod",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </form>
      )}
    </div>
  );
};

export default PeerEvaluationForm;
