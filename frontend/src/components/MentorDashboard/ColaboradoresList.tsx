import React, { useEffect, useState } from "react";
import {
  API_URL,
  getAuthHeaders,
  fetchMentorMentees,
  fetchMentorToCollaboratorEvaluationsByCollaborator,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { Collaborator as CollaboratorStatus } from "../../types/collaboratorStatus";

// Tipos para avaliação do gestor
interface EvaluationItem {
  criterionId: number;
  score: number | null;
  justification: string;
}
interface EvaluationGroup {
  groupId: number;
  items: EvaluationItem[];
  // Adicione status opcional para tipagem
  status?: string;
}
interface ManagerEvaluation {
  groups: EvaluationGroup[];
  status?: string;
}

// Tipos para autoavaliação
interface SelfEvaluationItem {
  criterionId: number;
  score: number;
  justification: string;
}
interface SelfEvaluation {
  items: SelfEvaluationItem[];
  cycle?: { id: number };
}

const statusStyles: Record<string, string> = {
  "Em andamento": "bg-yellow-100 text-yellow-800",
  Finalizado: "bg-green-100 text-green-800",
  Pendente: "bg-red-100 text-red-700",
};

const ColaboradoresList: React.FC = () => {
  const { user } = useAuth();
  const [colaboradores, setColaboradores] = useState<CollaboratorStatus[]>([]);
  const [evaluations, setEvaluations] = useState<
    Record<number, ManagerEvaluation | null>
  >({});
  const [selfEvaluations, setSelfEvaluations] = useState<
    Record<number, SelfEvaluation | null>
  >({});
  const [mentorEvaluations, setMentorEvaluations] = useState<
    Record<number, any>
  >({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Carrega todos os mentorados do mentor ao entrar na página
  useEffect(() => {
    if (user && user.id) {
      fetchMentorMentees(user.id)
        .then((mentees) => {
          setColaboradores(mentees || []);
          setLoading(false);
        })
        .catch(() => {
          setColaboradores([]);
          setLoading(false);
        });
    } else {
      setColaboradores([]);
      setLoading(false);
    }
  }, [user]);

  // Buscar avaliações dos colaboradores e do mentor
  useEffect(() => {
    if (colaboradores.length === 0) return;
    const ids = colaboradores.map((c) => c.id);
    Promise.all(
      ids.map((id) =>
        Promise.all([
          fetch(`${API_URL}/manager-evaluation/by-evaluatee/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
          })
            .then(async (res) => {
              if (!res.ok) return { id, evaluation: null };
              const evaluation = await res.json();
              return { id, evaluation };
            })
            .catch(() => ({ id, evaluation: null })),
          fetch(`${API_URL}/self-evaluation/user/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
          })
            .then(async (res) => {
              if (!res.ok) return { id, selfEval: null };
              const selfEvalArr = await res.json();
              let latest = null;
              if (Array.isArray(selfEvalArr) && selfEvalArr.length > 0) {
                latest = selfEvalArr.reduce((prev, curr) =>
                  prev.cycle && curr.cycle && prev.cycle.id > curr.cycle.id
                    ? prev
                    : curr
                );
              }
              return { id, selfEval: latest };
            })
            .catch(() => ({ id, selfEval: null })),
          fetchMentorToCollaboratorEvaluationsByCollaborator(id)
            .then((mentorEvals) => ({ id, mentorEvals }))
            .catch(() => ({ id, mentorEvals: null })),
        ])
      )
    ).then((results) => {
      const evalMap: Record<number, ManagerEvaluation | null> = {};
      const selfEvalMap: Record<number, SelfEvaluation | null> = {};
      const mentorEvalMap: Record<number, any> = {};
      results.forEach((tripleArr) => {
        const [{ id, evaluation }, { selfEval }, { mentorEvals }] = tripleArr;
        evalMap[id] = evaluation;
        selfEvalMap[id] = selfEval;
        mentorEvalMap[id] = mentorEvals;
      });
      setEvaluations(evalMap);
      setSelfEvaluations(selfEvalMap);
      setMentorEvaluations(mentorEvalMap);
    });
  }, [colaboradores]);

  // Função para calcular status, nota do gestor e nota de autoavaliação
  function getStatusAndScore(collaboratorId: number) {
    // Busca avaliações do mentor para o colaborador
    const mentorEval = mentorEvaluations[collaboratorId];
    const selfEval = selfEvaluations[collaboratorId];
    // Descobre o ciclo atual do mentor (IN_PROGRESS_MENTOR)
    // Para simplificar, pega o evaluation com maior cycleId
    let mentorStatus = "Pendente";
    let mentorScore: number | null = null;
    if (Array.isArray(mentorEval) && mentorEval.length > 0) {
      // Pega a avaliação do ciclo mais recente
      const latest = mentorEval.reduce((prev, curr) => {
        const prevCycle = prev.cycleId ?? prev.cycle?.id ?? 0;
        const currCycle = curr.cycleId ?? curr.cycle?.id ?? 0;
        return currCycle > prevCycle ? curr : prev;
      });
      mentorScore = latest.score ?? null;
      if (latest.status === "submitted") mentorStatus = "Finalizado";
      else if (latest.status === "draft" || latest.status === "in_progress")
        mentorStatus = "Em andamento";
      else mentorStatus = "Pendente";
    }
    // Calcula média da autoavaliação
    let selfScore: number | null = null;
    if (selfEval && selfEval.items && selfEval.items.length > 0) {
      selfScore =
        selfEval.items.reduce((sum, item) => sum + item.score, 0) /
        selfEval.items.length;
    }
    // Manager score (mantém lógica antiga)
    const evaluation = evaluations[collaboratorId];
    let managerScore: number | null = null;
    if (evaluation && evaluation.groups && evaluation.groups.length > 0) {
      const allCriteria = (evaluation.groups || []).flatMap(
        (g) => g.items || []
      );
      const withScore = allCriteria.filter(
        (c) => c.score !== null && c.score !== undefined
      );
      if (withScore.length > 0) {
        managerScore =
          withScore.reduce((sum, c) => sum + (c.score || 0), 0) /
          withScore.length;
      }
    }
    return {
      status: mentorStatus as "Finalizado" | "Em andamento" | "Pendente",
      managerScore,
      selfScore,
      mentorScore,
    };
  }

  if (loading)
    return (
      <div className="bg-white rounded-xl p-6 shadow-md w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Mentorados</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className="bg-white rounded-xl p-6 shadow-md w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Mentorados</h2>
      </div>
      <div className="space-y-4">
        {colaboradores.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum mentorado associado
            </h3>
            <p className="text-gray-500 text-sm">
              Você ainda não possui mentorados associados ao seu perfil de
              mentor.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Entre em contato com o RH para associar mentorados ao seu time.
            </p>
          </div>
        ) : (
          colaboradores.map((colab, idx) => {
            const { status, selfScore, managerScore, mentorScore } =
              getStatusAndScore(colab.id);
            return (
              <button
                key={colab.id || idx}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 rounded-lg px-2 sm:px-4 py-3 hover:bg-gray-100 transition cursor-pointer min-w-0"
                onClick={() => navigate(`/mentor/avaliacao/${colab.id}`)}
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-full sm:w-auto">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg sm:text-xl overflow-hidden">
                    {colab.name
                      ? colab.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
                      <span className="font-semibold text-gray-900 text-base sm:text-lg truncate max-w-[10rem] sm:max-w-xs block">
                        {colab.name}
                      </span>
                      <span
                        className={`mt-1 sm:mt-0 sm:ml-2 px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[8rem] sm:max-w-xs">
                      {colab.role || "Departamento"}
                    </div>
                  </div>
                </div>
                {/* Notas mentor, gestor e autoavaliação - só mostra se houver nota */}
                <div className="flex flex-row sm:flex-col gap-3 sm:gap-1 mt-2 sm:mt-0 items-end sm:items-end justify-between sm:justify-end w-full sm:w-auto">
                  {mentorScore !== null && mentorScore !== undefined && (
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {mentorScore.toFixed(1)}
                      </span>
                      <span className="ml-1">Nota mentor</span>
                    </div>
                  )}
                  {managerScore !== null && managerScore !== undefined && (
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {managerScore.toFixed(1)}
                      </span>
                      <span className="ml-1">Nota gestor</span>
                    </div>
                  )}
                  {selfScore !== null && selfScore !== undefined && (
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      <span className="font-semibold text-gray-900">
                        {selfScore.toFixed(1)}
                      </span>
                      <span className="ml-1">Autoavaliação</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ColaboradoresList;
