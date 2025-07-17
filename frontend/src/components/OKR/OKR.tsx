import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  fetchOkrsByUser,
  createOkr,
  updateOkr,
  deleteOkr,
  addKeyResult,
  updateKeyResult,
  deleteKeyResult,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface OKRItem {
  id: number;
  objective: string;
  keyResults: { id: number; description: string }[];
  progress: number;
  status: "ACTIVE" | "COMPLETED" | "OVERDUE";
  dueDate: string;
}

interface OKRProps {
  userRole?: string;
  title?: string;
  description?: string;
}

const OKR: React.FC<OKRProps> = ({
  userRole = "manager",
  title = "OKR - Objetivos e Resultados-Chave",
  description = "Defina e acompanhe seus objetivos estratégicos",
}) => {
  const { user } = useAuth();
  const [okrs, setOkrs] = useState<OKRItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newOKR, setNewOKR] = useState({
    objective: "",
    keyResults: [""],
    dueDate: "",
  });
  const [formErrors, setFormErrors] = useState<{
    objective?: string;
    keyResults?: string;
    dueDate?: string;
  }>({});
  const [editForm, setEditForm] = useState<{
    objective: string;
    keyResults: string[];
    dueDate: string;
  }>({ objective: "", keyResults: [""], dueDate: "" });
  const [editFormErrors, setEditFormErrors] = useState<{
    objective?: string;
    keyResults?: string;
    dueDate?: string;
  }>({});

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetchOkrsByUser(user.id)
        .then((data) => setOkrs(data))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "Em andamento";
      case "COMPLETED":
        return "Concluído";
      case "OVERDUE":
        return "Atrasado";
      default:
        return "Desconhecido";
    }
  };

  const validateForm = () => {
    const errors: {
      objective?: string;
      keyResults?: string;
      dueDate?: string;
    } = {};
    if (!newOKR.objective.trim())
      errors.objective = "O objetivo é obrigatório.";
    if (!newOKR.keyResults[0].trim())
      errors.keyResults = "Pelo menos um resultado-chave é obrigatório.";
    if (!newOKR.dueDate) errors.dueDate = "A data de conclusão é obrigatória.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddOKR = async () => {
    if (!validateForm()) return;
    if (user?.id) {
      const okr = await createOkr({
        userId: user.id,
        objective: newOKR.objective,
        dueDate: newOKR.dueDate,
        keyResults: newOKR.keyResults.filter((kr) => kr.trim()),
      });
      setOkrs([...okrs, okr]);
      setNewOKR({ objective: "", keyResults: [""], dueDate: "" });
      setShowAddForm(false);
      setFormErrors({});
    }
  };

  const handleUpdateProgress = async (id: number, progress: number) => {
    const okr = await updateOkr(id, {
      progress,
      status: progress >= 100 ? "COMPLETED" : "ACTIVE",
    });
    setOkrs(
      okrs.map((o) =>
        o.id === id ? { ...o, progress: okr.progress, status: okr.status } : o
      )
    );
  };

  const handleDeleteOKR = async (id: number) => {
    await deleteOkr(id);
    setOkrs(okrs.filter((okr) => okr.id !== id));
  };

  const addKeyResultField = () => {
    setNewOKR({
      ...newOKR,
      keyResults: [...newOKR.keyResults, ""],
    });
  };

  const updateKeyResultField = (index: number, value: string) => {
    const updatedKeyResults = [...newOKR.keyResults];
    updatedKeyResults[index] = value;
    setNewOKR({
      ...newOKR,
      keyResults: updatedKeyResults,
    });
  };

  const removeKeyResultField = (index: number) => {
    if (newOKR.keyResults.length > 1) {
      const updatedKeyResults = newOKR.keyResults.filter((_, i) => i !== index);
      setNewOKR({
        ...newOKR,
        keyResults: updatedKeyResults,
      });
    }
  };

  const startEdit = (okr: OKRItem) => {
    setEditingId(okr.id);
    setEditForm({
      objective: okr.objective,
      keyResults: okr.keyResults.map((kr) => kr.description),
      dueDate: okr.dueDate.slice(0, 10),
    });
    setEditFormErrors({});
  };

  const validateEditForm = () => {
    const errors: {
      objective?: string;
      keyResults?: string;
      dueDate?: string;
    } = {};
    if (!editForm.objective.trim())
      errors.objective = "O objetivo é obrigatório.";
    if (!editForm.keyResults[0]?.trim())
      errors.keyResults = "Pelo menos um resultado-chave é obrigatório.";
    if (!editForm.dueDate)
      errors.dueDate = "A data de conclusão é obrigatória.";
    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditKeyResultField = (index: number, value: string) => {
    const updated = [...editForm.keyResults];
    updated[index] = value;
    setEditForm({ ...editForm, keyResults: updated });
  };

  const addEditKeyResultField = () => {
    setEditForm({ ...editForm, keyResults: [...editForm.keyResults, ""] });
  };

  const removeEditKeyResultField = (index: number) => {
    if (editForm.keyResults.length > 1) {
      setEditForm({
        ...editForm,
        keyResults: editForm.keyResults.filter((_, i) => i !== index),
      });
    }
  };

  const handleSaveEdit = async (id: number) => {
    if (!validateEditForm()) return;
    // Atualiza objetivo e data
    const updated = await updateOkr(id, {
      objective: editForm.objective,
      dueDate: editForm.dueDate,
    });
    // Atualiza keyResults
    const okr = okrs.find((o) => o.id === id);
    if (okr) {
      // Mapear keyResults existentes e novos
      const existing = okr.keyResults;
      const newKRs = editForm.keyResults;
      // Atualizar ou criar
      for (let i = 0; i < newKRs.length; i++) {
        const value = newKRs[i];
        if (existing[i]) {
          if (existing[i].description !== value) {
            await updateKeyResult(existing[i].id, value);
          }
        } else {
          await addKeyResult(id, value);
        }
      }
      // Remover keyResults extras
      if (existing.length > newKRs.length) {
        for (let i = newKRs.length; i < existing.length; i++) {
          await deleteKeyResult(existing[i].id);
        }
      }
    }
    // Buscar OKRs atualizados
    if (user?.id) {
      const fresh = await fetchOkrsByUser(user.id);
      setOkrs(fresh);
    }
    setEditingId(null);
  };

  return (
    <div className="w-full flex flex-col gap-4 p-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-[#08605F] hover:bg-[#064a49] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Novo OKR
        </button>
      </div>

      {/* Formulário de adição */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Novo OKR</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={newOKR.objective}
                onChange={(e) =>
                  setNewOKR({ ...newOKR, objective: e.target.value })
                }
                className={`w-full p-3 border ${
                  formErrors.objective ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                rows={3}
                placeholder="Descreva o objetivo principal..."
              />
              {formErrors.objective && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.objective}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultados-Chave <span className="text-red-500">*</span>
              </label>
              {newOKR.keyResults.map((kr, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={kr}
                    onChange={(e) =>
                      updateKeyResultField(index, e.target.value)
                    }
                    className={`flex-1 p-3 border ${
                      formErrors.keyResults && index === 0
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder={`Resultado-chave ${index + 1}`}
                  />
                  {newOKR.keyResults.length > 1 && (
                    <button
                      onClick={() => removeKeyResultField(index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {formErrors.keyResults && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.keyResults}
                </p>
              )}
              <button
                onClick={addKeyResultField}
                className="text-green-600 hover:text-green-700 text-sm font-medium"
              >
                + Adicionar resultado-chave
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Conclusão <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newOKR.dueDate}
                onChange={(e) =>
                  setNewOKR({ ...newOKR, dueDate: e.target.value })
                }
                className={`w-full p-3 border ${
                  formErrors.dueDate ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent`}
              />
              {formErrors.dueDate && (
                <p className="text-red-500 text-xs mt-1">
                  {formErrors.dueDate}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddOKR}
                className="bg-[#08605F] hover:bg-[#064a49] text-white px-6 py-2 rounded-lg transition-colors"
                disabled={
                  !newOKR.objective.trim() ||
                  !newOKR.keyResults[0].trim() ||
                  !newOKR.dueDate
                }
              >
                Salvar OKR
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setFormErrors({});
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de OKRs */}
      <div className="space-y-6">
        {loading ? (
          <div>Carregando OKRs...</div>
        ) : okrs.length ===0 && !showAddForm ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum OKR definido
            </h3>
            <p className="text-gray-500 mb-4">
              Comece criando seu primeiro OKR para definir objetivos claros e
              mensuráveis.
            </p>
          </div>
        ) : (
          okrs.map((okr) => (
            <div
              key={okr.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {editingId === okr.id ? (
                    <>
                      <input
                        type="text"
                        value={editForm.objective}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            objective: e.target.value,
                          })
                        }
                        className={`w-full p-2 border ${
                          editFormErrors.objective
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg mb-2`}
                        placeholder="Objetivo"
                      />
                      {editFormErrors.objective && (
                        <p className="text-red-500 text-xs mb-2">
                          {editFormErrors.objective}
                        </p>
                      )}
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Resultados-Chave{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        {editForm.keyResults.map((kr, idx) => (
                          <div key={idx} className="flex gap-2 mb-1">
                            <input
                              type="text"
                              value={kr}
                              onChange={(e) =>
                                handleEditKeyResultField(idx, e.target.value)
                              }
                              className={`flex-1 p-2 border ${
                                editFormErrors.keyResults && idx === 0
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg`}
                              placeholder={`Resultado-chave ${idx + 1}`}
                            />
                            {editForm.keyResults.length > 1 && (
                              <button
                                onClick={() => removeEditKeyResultField(idx)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {editFormErrors.keyResults && (
                          <p className="text-red-500 text-xs mb-2">
                            {editFormErrors.keyResults}
                          </p>
                        )}
                        <button
                          onClick={addEditKeyResultField}
                          className="text-green-600 hover:text-green-700 text-xs font-medium"
                        >
                          + Adicionar resultado-chave
                        </button>
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data de Conclusão{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={editForm.dueDate}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              dueDate: e.target.value,
                            })
                          }
                          className={`w-full p-2 border ${
                            editFormErrors.dueDate
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg`}
                        />
                        {editFormErrors.dueDate && (
                          <p className="text-red-500 text-xs mb-2">
                            {editFormErrors.dueDate}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(okr.id)}
                          className="bg-[#08605F] hover:bg-[#064a49] text-white px-4 py-1 rounded-lg"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-300 text-gray-700 px-4 py-1 rounded-lg hover:bg-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {okr.objective}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            okr.status
                          )}`}
                        >
                          {getStatusText(okr.status)}
                        </span>
                        <span>
                          Vencimento:{" "}
                          {new Date(okr.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      editingId === okr.id ? setEditingId(null) : startEdit(okr)
                    }
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteOKR(okr.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Resultados-Chave */}
              {editingId !== okr.id && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Resultados-Chave:
                  </h4>
                  <ul className="space-y-2">
                    {okr.keyResults.map((kr, index) => (
                      <li key={kr.id} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          {kr.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OKR;
