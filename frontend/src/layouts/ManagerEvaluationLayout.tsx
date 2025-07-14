import {
  fetchManagerEvaluation,
  updateManagerEvaluation,
} from "../services/api";
import React, { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useParams } from "react-router-dom";
import type { Collaborator } from "../types/collaboratorStatus";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:3000";

export default function ManagerEvaluationLayout() {
  const { id } = useParams();
  const { user } = useAuth();
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [evaluationStatus, setEvaluationStatus] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [evaluationId, setEvaluationId] = useState<number | null>(null);
  // Ref para acessar a função de submit do filho
  const submitRef = useRef<(() => Promise<boolean>) | null>(null);

  useEffect(() => {
    if (user && user.id && id) {
      fetch(`${API_URL}/managers/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const parsed = (data.collaborators || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            role: c.roles?.[0]?.role || "Colaborador",
            status: c.status || "Em andamento",
            selfScore: c.selfScore ?? 0,
            managerScore: c.managerScore ?? null,
          }));
          const found = parsed.find((c: Collaborator) => c.id === Number(id));
          setCollaborator(found || null);
        })
        .catch(() => setCollaborator(null));
    }
  }, [user, id]);

  // Busca avaliação para status/createdAt
  useEffect(() => {
    async function fetchEval() {
      if (!id) return;
      try {
        const evaluation = await fetchManagerEvaluation(Number(id));
        if (evaluation) {
          setEvaluationStatus(evaluation.status || null);
          setCreatedAt(evaluation.createdAt || null);
          setEvaluationId(evaluation.id || null);
          setIsEditing(evaluation.status !== "submitted");
          setHasSent(evaluation.status === "submitted");
        } else {
          setEvaluationStatus(null);
          setCreatedAt(null);
          setEvaluationId(null);
          setIsEditing(true);
          setHasSent(false);
        }
      } catch {
        setEvaluationStatus(null);
        setCreatedAt(null);
        setEvaluationId(null);
        setIsEditing(true);
        setHasSent(false);
      }
    }
    fetchEval();
  }, [id]);

  // Recebe do filho se é update ou create
  const handleSetSubmit = (fn: () => Promise<boolean>, updateFlag: boolean) => {
    submitRef.current = fn;
    setIsUpdate(updateFlag);
  };

  // Sempre que isEditing mudar, editKey também muda para forçar remount do Outlet
  const [editKey, setEditKey] = useState(0);
  useEffect(() => {
    setEditKey((k) => k + 1);
  }, [isEditing]);

  const handleSend = async () => {
    if (isEditing) {
      // Envia avaliação normalmente (submit)
      if (submitRef.current) {
        const ok = await submitRef.current();
        if (ok) {
          // Atualiza status/createdAt após envio
          if (id) {
            const evaluation = await fetchManagerEvaluation(Number(id));
            if (evaluation) {
              setEvaluationStatus(evaluation.status || null);
              setCreatedAt(evaluation.createdAt || null);
              setEvaluationId(evaluation.id || null);
              setIsEditing(evaluation.status !== "submitted");
              setHasSent(evaluation.status === "submitted");
            }
          }
          window.alert("Avaliação enviada com sucesso!");
        } else {
          window.alert("Erro ao enviar avaliação.");
        }
      }
    } else {
      // Ao clicar em editar, volta status para draft e libera edição
      if (!evaluationId) {
        window.alert(
          "[DEBUG] Não existe evaluationId para editar!\nTalvez a avaliação ainda não foi criada ou houve erro ao buscar."
        );
        return;
      }
      // Busca avaliação atual para pegar os grupos e ciclo
      const evaluation = await fetchManagerEvaluation(Number(id));
      if (evaluation && evaluation.groups) {
        // Monta os grupos apenas com os campos essenciais em cada item
        const groups = evaluation.groups.map((group: any) => ({
          groupId: group.groupId,
          items: group.items.map((item: any) => ({
            criterionId: item.criterionId,
            score: item.score,
            justification: item.justification,
            ...(item.scoreDescription
              ? { scoreDescription: item.scoreDescription }
              : {}),
          })),
        }));
        const payload = {
          status: "draft",
          groups,
          cycleId: evaluation.cycleId, // sempre envia
          evaluateeId: Number(id), // sempre envia
        };
        await updateManagerEvaluation(evaluationId, payload);
        // Após update, busca avaliação atualizada para garantir status draft
        const updated = await fetchManagerEvaluation(Number(id));
        console.log(
          "[DEBUG] Status retornado do backend após editar:",
          updated?.status
        );
        setEvaluationStatus(updated?.status || "draft");
        setIsEditing(true); // libera edição
        setHasSent(false);
        console.log("[DEBUG] isEditing após editar:", true);
        // editKey será atualizado pelo useEffect acima
      } else {
        window.alert("Erro ao buscar avaliação para editar.");
      }
    }
  };

  if (!collaborator) {
    return <div>Colaborador não encontrado</div>;
  }

  const { name, role } = collaborator;
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen flex bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="fixed top-0 left-64 right-0 w-[calc(100%-16rem)] bg-white shadow-md z-30">
          <div className="px-8 py-5 flex flex-row items-center border-b border-gray-200 justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                {initials}
              </div>
              <div className="truncate">
                <h1 className="text-xl font-bold text-gray-900 leading-tight truncate">
                  {name}
                </h1>
                <p className="text-sm text-gray-500 truncate">COLABORADOR</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {createdAt && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  Último envio: {new Date(createdAt).toLocaleString("pt-BR")}
                </span>
              )}
              <button
                className="bg-[#8CB7B7] font-semibold text-white px-5 py-2 rounded-md text-sm shadow-sm hover:bg-[#7aa3a3] transition whitespace-nowrap"
                onClick={handleSend}
              >
                {evaluationStatus === "submitted" && !isEditing
                  ? "Editar avaliação"
                  : isEditing && hasSent
                  ? "Atualizar"
                  : "Enviar"}
              </button>
            </div>
          </div>
          <nav className="bg-white border-b border-gray-100">
            <ul className="flex px-8 pt-4 gap-16 text-lg text-gray-600 font-semibold">
              <li>
                <NavLink
                  to=""
                  end
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-teal-700 pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-3 flex items-center gap-2"
                  }
                >
                  Avaliação
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="360"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-teal-700 pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-3 flex items-center gap-2"
                  }
                >
                  Avaliação 360
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="historico"
                  className={({ isActive }) =>
                    isActive
                      ? "border-b-2 border-teal-700 pb-3 text-teal-700 flex items-center gap-2"
                      : "pb-3 flex items-center gap-2"
                  }
                >
                  Histórico
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
        <div className="h-[145px]" />
        {/* Espaço para não cobrir o conteúdo pelo bloco fixo */}
        <main className="flex-1 flex justify-center items-start p-2 sm:p-4">
          <div className="w-full max-w-7xl">
            <Outlet
              key={editKey}
              context={{ setSubmit: handleSetSubmit, isEditing }}
            />
          </div>
        </main>
      </div>
      {/* Corrige o fundo cinza para encostar nas bordas */}
      <style>{`
        body, #root {
          background: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
}
