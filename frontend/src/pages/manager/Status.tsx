import React, { useEffect, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import CollaboratorCard from "../../components/manager/CollaboratorCard";
import type { Collaborator } from "../../types/collaboratorStatus.tsx";
import { useAuth } from "../../context/AuthContext";
import {
  API_URL,
  getAuthHeaders,
  fetchActiveEvaluationCycle,
} from "../../services/api";

export default function Collaborators() {
  const [search, setSearch] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [evaluations, setEvaluations] = useState<Record<number, any>>({});
  const [selfEvaluations, setSelfEvaluations] = useState<Record<number, any>>(
    {}
  );
  const [currentCycleId, setCurrentCycleId] = useState<number | null>(null);
  // Busca o ciclo atual do gestor ao montar
  useEffect(() => {
    fetchActiveEvaluationCycle("MANAGER")
      .then((cycle) => setCurrentCycleId(cycle?.id ?? null))
      .catch(() => setCurrentCycleId(null));
  }, []);
  const { user } = useAuth();

  // Carrega todos os colaboradores do manager ao entrar na página
  useEffect(() => {
    if (user && user.id) {
      fetch(`${API_URL}/managers/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          const parsed = (data.collaborators || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            photo: c.photo,
            role: c.roles?.[0]?.role || "Colaborador",
            status: "Em andamento",
            selfScore: c.selfScore ?? 0,
            managerScore: null,
          }));
          setCollaborators(parsed);
        })
        .catch(() => setCollaborators([]));
    }
  }, [user]);

  useEffect(() => {
    if (!currentCycleId) return;
    // Filtra colaboradores pelo nome
    const filtered = search.trim()
      ? collaborators.filter((c) =>
          c.name.toLowerCase().includes(search.trim().toLowerCase())
        )
      : collaborators;
    // Busca avaliações e autoavaliações reais do ciclo atual
    const ids = filtered.map((c) => c.id);
    if (ids.length === 0) return;
    Promise.all(
      ids.map((id) =>
        Promise.all([
          fetch(
            `${API_URL}/manager-evaluation/by-evaluatee/${id}?cycleId=${currentCycleId}`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          )
            .then(async (res) => {
              if (!res.ok) return { id, evaluation: null };
              const evaluation = await res.json();
              return { id, evaluation };
            })
            .catch(() => ({ id, evaluation: null })),
          fetch(
            `${API_URL}/self-evaluation/user/${id}?cycleId=${currentCycleId}`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          )
            .then(async (res) => {
              if (!res.ok) return { id, selfEval: null };
              const selfEval = await res.json();
              // Se vier array, pega a do ciclo atual
              if (Array.isArray(selfEval)) {
                const found =
                  selfEval.find(
                    (s) => s.cycle && s.cycle.id === currentCycleId
                  ) || null;
                return { id, selfEval: found };
              }
              // Se vier objeto único, valida ciclo
              if (
                selfEval &&
                selfEval.cycle &&
                selfEval.cycle.id === currentCycleId
              ) {
                return { id, selfEval };
              }
              return { id, selfEval: null };
            })
            .catch(() => ({ id, selfEval: null })),
        ])
      )
    ).then((results) => {
      const evalMap: Record<number, any> = {};
      const selfEvalMap: Record<number, any> = {};
      results.forEach((pairArr) => {
        const [{ id, evaluation }, { selfEval }] = pairArr;
        evalMap[id] = evaluation;
        selfEvalMap[id] = selfEval;
      });
      setEvaluations(evalMap);
      setSelfEvaluations(selfEvalMap);
    });
  }, [search, collaborators, currentCycleId]);

  // Função para calcular status, nota do gestor e nota de autoavaliação
  function getStatusAndScore(collaboratorId: number) {
    const evaluation = evaluations[collaboratorId];
    const selfEval = selfEvaluations[collaboratorId];
    let managerScore = null;
    let selfScore = null;
    if (evaluation && evaluation.groups) {
      const allCriteria = (evaluation.groups || []).flatMap(
        (g: any) => g.items || []
      );
      const withScore = allCriteria.filter(
        (c: any) => c.score !== null && c.score !== undefined
      );
      if (withScore.length > 0) {
        managerScore =
          withScore.reduce((sum: number, c: any) => sum + (c.score || 0), 0) /
          withScore.length;
      }
    }
    if (selfEval && selfEval.items && selfEval.items.length > 0) {
      selfScore =
        selfEval.items.reduce((sum: number, item: any) => sum + item.score, 0) /
        selfEval.items.length;
    }
    if (!evaluation) {
      return { status: "Pendente" as const, managerScore: null, selfScore };
    }
    if (evaluation.status === "submitted") {
      return { status: "Finalizado" as const, managerScore, selfScore };
    }
    if (evaluation.status === "draft") {
      return { status: "Em andamento" as const, managerScore, selfScore };
    }
    // fallback para casos inesperados
    return { status: "Pendente" as const, managerScore, selfScore };
  }

  // Responsivo: Top bar, busca e lista
  const filtered = search.trim()
    ? collaborators.filter((c) =>
        c.name.toLowerCase().includes(search.trim().toLowerCase())
      )
    : collaborators;
  const list = filtered;
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F1F1F1] overflow-x-hidden sm:overflow-x-visible max-w-md sm:max-w-full mx-auto sm:mx-0">
      {/* Top bar com espaço para ícone da sidebar */}
      <div className="flex items-center gap-2 px-1 sm:px-6 pt-5 pb-3 justify-center sm:justify-start">
        {/* Espaço reservado para o ícone da sidebar apenas no desktop */}
        <div className="hidden sm:flex h-10 items-center justify-center mr-0">
          {/* O ícone real da sidebar deve ser renderizado pelo layout principal */}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight truncate text-left">
          Colaboradores
        </h1>
      </div>
      {/* Container unificado para busca e cards */}
      <div className="w-full px-1 sm:px-6 mx-auto">
        {/* Barra de busca responsiva */}
        <div className="flex items-center gap-2 rounded-xl py-3 px-3 bg-white/50 mt-0 mb-6 w-full">
          <IoIosSearch size={16} className="text-[#1D1D1D]/75 mr-2" />
          <input
            type="text"
            placeholder="Buscar por colaboradores"
            className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent min-w-0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Lista responsiva de colaboradores */}
        <div className="flex flex-col gap-4 sm:gap-6 w-full pb-6">
          {list.length > 0 ? (
            list.map((collaborator: any) => {
              const { status, managerScore, selfScore } = getStatusAndScore(
                collaborator.id
              );
              return (
                <CollaboratorCard
                  key={collaborator.id}
                  collaborator={{
                    ...collaborator,
                    status,
                    managerScore,
                    selfScore,
                  }}
                />
              );
            })
          ) : (
            <p className="text-sm text-[#1D1D1D]/50 p-2 text-center">
              Nenhum colaborador encontrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
