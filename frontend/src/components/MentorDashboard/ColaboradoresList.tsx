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
}
interface ManagerEvaluation {
  groups: EvaluationGroup[];
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
  const [mentorEvaluations, setMentorEvaluations] = useState<Record<number, any>>(
    {}
  );
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

  // Buscar avaliações dos colaboradores
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
              const evaluation: ManagerEvaluation = await res.json();
              return { id, evaluation };
            })
            .catch(() => ({ id, evaluation: null })),
          fetch(`${API_URL}/self-evaluation/user/${id}`, {
            method: "GET",
            headers: getAuthHeaders(),
          })
            .then(async (res) => {
              if (!res.ok) return { id, selfEval: null };
              const selfEvalArr: SelfEvaluation[] = await res.json();
              // Pega a autoavaliação mais recente (maior cycleId)
              let latest: SelfEvaluation | null = null;
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
          fetchMentorToCollaboratorEvaluationsByCollaborator(id).catch(() => null),
        ])
      )
    ).then((results) => {
      const evalMap: Record<number, ManagerEvaluation | null> = {};
      const selfEvalMap: Record<number, SelfEvaluation | null> = {};
      const mentorEvalMap: Record<number, any> = {};
      results.forEach((tripleArr) => {
        const [{ id, evaluation }, { selfEval }, mentorEval] = tripleArr;
        evalMap[id] = evaluation;
        selfEvalMap[id] = selfEval;
        mentorEvalMap[id] = mentorEval;
      });
      setEvaluations(evalMap);
      setSelfEvaluations(selfEvalMap);
      setMentorEvaluations(mentorEvalMap);
    });
  }, [colaboradores]);

  // Função para calcular status, nota do gestor, nota do mentor e autoavaliação
  function getStatusAndScore(collaboratorId: number) {
    const evaluation = evaluations[collaboratorId];
    const selfEval = selfEvaluations[collaboratorId];
    const mentorEval = mentorEvaluations[collaboratorId];
    const allCriteria = (evaluation?.groups || []).flatMap(
      (g) => g.items || []
    );
    // Critérios com nota preenchida
    const withScore = allCriteria.filter(
      (c) => c.score !== null && c.score !== undefined
    );
    // Critérios com nota E justificativa preenchidas
    const filled = allCriteria.filter(
      (c) =>
        c.score !== null &&
        c.score !== undefined &&
        c.justification &&
        c.justification.trim() !== ""
    );
    const total = allCriteria.length;
    let managerScore: number | null = null;
    if (withScore.length > 0) {
      managerScore =
        withScore.reduce((sum, c) => sum + (c.score || 0), 0) /
        withScore.length;
    }
    // Calcula média da autoavaliação
    let selfScore: number | null = null;
    if (selfEval && selfEval.items && selfEval.items.length > 0) {
      selfScore =
        selfEval.items.reduce((sum, item) => sum + item.score, 0) /
        selfEval.items.length;
    }
    // Nota do mentor
    let mentorScore: number | null = null;
    if (mentorEval && Array.isArray(mentorEval) && mentorEval.length > 0) {
      // Se vier array, pega a nota do ciclo mais recente
      const latest = mentorEval.reduce((prev, curr) =>
        prev.cycleId && curr.cycleId && prev.cycleId > curr.cycleId ? prev : curr
      );
      mentorScore = latest.score ?? null;
    } else if (mentorEval && mentorEval.score !== undefined) {
      mentorScore = mentorEval.score;
    }
    if (!evaluation || total === 0 || withScore.length === 0) {
      return { status: "Pendente" as const, managerScore: null, selfScore, mentorScore };
    }
    if (filled.length < total) {
      return { status: "Em andamento" as const, managerScore, selfScore, mentorScore };
    }
    return { status: "Finalizado" as const, managerScore, selfScore, mentorScore };
  }

  if (loading)
    return (
      <div className="bg-white rounded-xl p-6 shadow-md w-full max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Colaboradores</h2>
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
        <h2 className="text-lg font-semibold text-gray-900">Colaboradores</h2>
        <a
          href="/manager/collaborators"
          className="text-sm text-teal-700 font-medium hover:underline"
        >
          Ver mais
        </a>
      </div>
      <div className="space-y-4">
        {colaboradores.map((colab, idx) => {
          const { status, selfScore, managerScore, mentorScore } = getStatusAndScore(
            colab.id
          );
          return (
            <button
              key={colab.id || idx}
              className="w-full flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 hover:bg-gray-100 transition cursor-pointer"
              onClick={() => navigate(`/mentor/avaliacao/${colab.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg">
                  {colab.name
                    ? colab.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "C"}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 leading-tight">
                    {colab.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {colab.role || "Departamento"}
                  </div>
                </div>
                <span
                  className={`ml-4 px-2 py-0.5 rounded text-xs font-medium ${statusStyles[status]}`}
                >
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-xs text-gray-500">
                  Autoavaliação{" "}
                  <span className="ml-1 font-semibold text-gray-900">
                    {selfScore !== null && selfScore !== undefined
                      ? selfScore.toFixed(1)
                      : "-"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Nota mentor{" "}
                  <span className="ml-1 font-semibold text-gray-900">
                    {mentorScore !== null && mentorScore !== undefined
                      ? mentorScore.toFixed(1)
                      : "-"}
                  </span>
                </div>
                <span className="ml-2 text-gray-400 hover:text-teal-700">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ColaboradoresList;
