import { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import Select from "react-select";

import { UserIcon } from "../UserIcon";
import StarRating from "../StarRating";
import StarRatingReadOnly from "../StarRatingReadOnly";
import {
  updatePeerEvaluation,
  deletePeerEvaluation,
  getProjects,
} from "../../services/api";
import { useEvaluation } from "../../context/EvaluationsContext";

import type {
  PeerEvaluation,
  PeerEvaluationFormProps,
} from "../../types/peerEvaluation";

type MotivationOption = {
  value: string;
  label: string;
};

type ProjectOption = { value: string; label: string };

const motivationOptions: MotivationOption[] = [
  { value: "CONCORDO_TOTALMENTE", label: "Concordo Totalmente" },
  { value: "CONCORDO_PARCIALMENTE", label: "Concordo Parcialmente" },
  { value: "DISCORDO_PARCIALMENTE", label: "Discordo Parcialmente" },
  { value: "DISCORDO_TOTALMENTE", label: "Discordo Totalmente" },
];

export default function PeerEvaluationForm({
  myEvaluations,
  setMyEvaluations,
  isCycleFinished = false,
}: PeerEvaluationFormProps) {
  const [formData, setFormData] = useState<{ [key: number]: any }>({});
  const [error, setError] = useState<string | null>(null);
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { updateTabCompletion } = useEvaluation();

  useEffect(() => {
    if (myEvaluations) {
      checkIfCompleted(myEvaluations);
    }
  }, [formData, myEvaluations]);

  useEffect(() => {
    getProjects()
      .then((projects) => {
        // projects deve ser um array, ex: [{ id, name, ... }]
        const options = projects.map((p: any) => ({
          value: p.name,
          label: p.name,
        }));
        setProjectOptions(options);
      })
      .catch((err) => {
        console.error("Erro ao carregar projetos:", err);
      });
  }, []);

  useEffect(() => {
    if (Object.keys(formData).length === 0 && myEvaluations.length > 0) {
      const initialData: { [key: number]: any } = {};
      myEvaluations.forEach((evaluation) => {
        initialData[evaluation.id] = {
          score: evaluation.score ?? 0,
          strengths: evaluation.strengths || "",
          improvements: evaluation.improvements || "",
          motivation: evaluation.motivation || "",
          projectName: evaluation.projects[0]?.project.name || "",
          projectPeriod: evaluation.projects[0]?.period?.toString() || "",
        };
      });
      setFormData(initialData);
    }
  }, [myEvaluations]);

  const debouncedSave = (evaluationId: number, data: any) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const updated = await updatePeerEvaluation(evaluationId, data);

        const updatedEvaluations = myEvaluations.map((e) =>
          e.id === evaluationId ? { ...e, ...updated } : e
        );

        setMyEvaluations(updatedEvaluations);
        checkIfCompleted(updatedEvaluations);
      } catch (err) {
        console.error("Erro ao salvar:", err);
        setError("Erro ao salvar avaliação.");
      }
    }, 500);
  };

  const handleInputChange = (
    evaluationId: number,
    field: string,
    value: any
  ) => {
    if (error) setError(null);

    setFormData((prev) => {
      const updated = {
        ...prev,
        [evaluationId]: {
          ...prev[evaluationId],
          [field]: value,
        },
      };

      // Pegamos os valores já atualizados
      const current = updated[evaluationId];

      if (field === "projectName") {
        // Quando um projeto é selecionado, define o período como 0 por padrão
        if (value) {
          updated[evaluationId].projectPeriod = "0";
          current.projectPeriod = "0";
        } else {
          // Se o projeto for desmarcado, limpa o período
          updated[evaluationId].projectPeriod = "";
          current.projectPeriod = "";
        }
      }

      if (field === "projectName" || field === "projectPeriod") {
        const projectName = current.projectName?.trim();
        const projectPeriod = current.projectPeriod?.trim();

        // Se ambos estiverem vazios, envia array vazio
        if (!projectName && !projectPeriod) {
          debouncedSave(evaluationId, { projects: [] });
        }

        // Se projeto estiver preenchido, sempre envia (período será 0 por padrão se não foi alterado)
        if (projectName) {
          debouncedSave(evaluationId, {
            projects: [
              {
                name: projectName,
                period: Number(projectPeriod) || 0,
              },
            ],
          });
        }
      } else {
        debouncedSave(evaluationId, { [field]: value });
      }

      // Remove o erro se estiver tudo preenchido
      const isComplete =
        current.score &&
        current.strengths?.trim() &&
        current.improvements?.trim() &&
        current.motivation &&
        current.projectName?.trim() &&
        current.projectPeriod?.trim();

      if (isComplete) {
        setError(null);
      }

      return updated;
    });
  };

  const handleRemoveEvaluation = async (evaluationId: number) => {
    try {
      await deletePeerEvaluation(evaluationId);
      setMyEvaluations((prev) =>
        prev.filter((evaluation) => evaluation.id !== evaluationId)
      );
      updateTabCompletion("peer", false);
      setError(null);
    } catch (err) {
      console.error("Erro ao excluir avaliação", err);
      setError("Erro ao excluir avaliação");
    }
  };

  const checkIfCompleted = async (updatedEvaluations: PeerEvaluation[]) => {
    setError(null);

    if (updatedEvaluations.length === 0) {
      // Sem avaliações, marca incompleto
      updateTabCompletion("peer", false);
      return;
    }

    // Verifica se pelo menos uma avaliação está completa
    const hasOneComplete = updatedEvaluations.some((evaluation) => {
      const data = formData[evaluation.id];
      return (
        data?.score &&
        data?.strengths?.trim() &&
        data?.improvements?.trim() &&
        data?.motivation &&
        data?.projectName?.trim() &&
        data?.projectPeriod?.trim()
      );
    });

    if (hasOneComplete) {
      updateTabCompletion("peer", true);
      setError(null);
    } else {
      updateTabCompletion("peer", false);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="flex flex-col gap-4 w-full">
      {myEvaluations.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Você ainda não possui colaboradores para avaliação.
        </p>
      ) : (
        <form className="flex flex-col gap-4">
          {myEvaluations.map((evaluation) => {
            const data = formData[evaluation.id] || {
              score: 0,
              strengths: "",
              improvements: "",
              motivation: "",
              projectName: "",
              projectPeriod: "",
            };
            const readonly = isCycleFinished;

            return (
              <div
                key={evaluation.id}
                className={`bg-white w-full flex flex-col px-6 py-9 rounded-xl ${
                  readonly ? "opacity-80" : ""
                }`}
              >
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-3">
                    <UserIcon
                      initials={getInitials(evaluation.evaluatee.name)}
                      size={40}
                    />
                    <div className="flex flex-col">
                      <p className="text-sm font-bold">
                        {evaluation.evaluatee.name}
                      </p>
                      <p className="text-xs text-opacity-75 text-[#1D1D1D]">
                        {evaluation.evaluatee.email}
                      </p>
                    </div>
                  </div>
                  {!readonly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEvaluation(evaluation.id)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <FaTrash className="text-[#F33E3E]" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col mb-4 gap-3">
                  <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                    Dê uma avaliação de 1 a 5 ao colaborador
                  </p>
                  {readonly ? (
                    <StarRatingReadOnly score={evaluation.score} dimmed />
                  ) : (
                    <StarRating
                      score={data.score ?? 0}
                      onChange={(s) =>
                        handleInputChange(evaluation.id, "score", s)
                      }
                    />
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  {["strengths", "improvements"].map((field) => (
                    <div className="flex flex-col gap-1 flex-1" key={field}>
                      <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                        {field === "strengths"
                          ? "Pontos fortes"
                          : "Pontos de melhoria"}
                      </p>
                      <textarea
                        className={`w-full h-24 resize-none p-2 rounded border border-gray-300 text-sm ${
                          readonly
                            ? "bg-gray-100 text-[#1D1D1D]"
                            : "focus:outline-[#08605e4a]"
                        }`}
                        placeholder={
                          field === "strengths"
                            ? "Descreva os pontos fortes..."
                            : "Descreva os pontos de melhoria..."
                        }
                        value={data[field]}
                        onChange={(e) =>
                          handleInputChange(
                            evaluation.id,
                            field,
                            e.target.value
                          )
                        }
                        disabled={readonly}
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                      Você ficaria motivado em trabalhar novamente?
                    </p>
                    <Select
                      menuPortalTarget={document.body}
                      options={motivationOptions}
                      value={
                        motivationOptions.find(
                          (opt) => opt.value === data.motivation
                        ) || null
                      }
                      onChange={(selected) =>
                        handleInputChange(
                          evaluation.id,
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
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                          position: "absolute",
                        }),
                      }}
                    />
                  </div>
                  <div className="flex flex-col md:flex-row flex-wrap gap-2 w-full">
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                        Projeto em que atuaram juntos
                      </p>
                      <Select
                        menuPortalTarget={document.body}
                        options={projectOptions}
                        value={
                          projectOptions.find(
                            (opt) => opt.value === data.projectName
                          ) || null
                        }
                        onChange={(selected) =>
                          handleInputChange(
                            evaluation.id,
                            "projectName",
                            selected ? selected.value : ""
                          )
                        }
                        isDisabled={readonly}
                        placeholder="Selecione o projeto"
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
                              borderColor: state.isFocused
                                ? "#08605e4a"
                                : "#ccc",
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
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                            position: "absolute",
                          }),
                        }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="font-medium text-xs text-opacity-75 text-[#1D1D1D]">
                        Período (em meses)
                      </p>
                      <input
                        type="text"
                        className={`w-full h-9 p-2 rounded border border-gray-300 text-sm ${
                          readonly || !data.projectName
                            ? "bg-gray-100 text-[#1D1D1D]"
                            : "focus:outline-[#08605e4a]"
                        }`}
                        placeholder={
                          data.projectName
                            ? "Insira apenas o número"
                            : "Selecione um projeto"
                        }
                        value={data.projectPeriod}
                        onChange={(e) =>
                          handleInputChange(
                            evaluation.id,
                            "projectPeriod",
                            e.target.value
                          )
                        }
                        disabled={readonly || !data.projectName}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </form>
      )}
    </div>
  );
}
