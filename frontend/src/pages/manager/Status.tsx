import React, { useEffect, useState } from "react";
import searchIcon from "../../assets/search.png";
import CollaboratorCard from "../../components/manager/CollaboratorCard";
import type { Collaborator } from "../../types/collaboratorStatus.tsx";
import { useAuth } from "../../context/AuthContext";
import { API_URL, getAuthHeaders } from "../../services/api";

export default function Collaborators() {
  const [search, setSearch] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [searchResults, setSearchResults] = useState<Collaborator[]>([]);
  const [evaluations, setEvaluations] = useState<Record<number, any>>({});
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

  // Busca filtrada ao digitar na searchbar
  useEffect(() => {
    if (search.trim() !== "" && user && user.id) {
      const url = `${API_URL}/manager-search-bar/${user.id}?search=${encodeURIComponent(
        search.trim()
      )}`;
      const headers = getAuthHeaders();
      fetch(url, {
        method: "GET",
        headers,
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            return setSearchResults([]);
          }
          setSearchResults(
            (data || []).map((c: any) => ({
              id: c.id,
              name: c.name,
              email: c.email,
              photo: c.photo,
              role: "Colaborador",
              status: "Em andamento",
              selfScore: 0,
              managerScore: null,
            }))
          );
        })
        .catch(() => {
          setSearchResults([]);
        });
    } else {
      setSearchResults([]);
    }
  }, [search, user]);

  // Buscar avaliações dos colaboradores visíveis (tanto lista quanto busca)
  useEffect(() => {
    const currentList = search.trim() !== "" ? searchResults : collaborators;
    const ids = currentList.map((c) => c.id);
    if (ids.length === 0) return;
    Promise.all(
      ids.map((id) =>
        fetch(`${API_URL}/manager-evaluation/by-evaluatee/${id}`, {
          method: "GET",
          headers: getAuthHeaders(),
        })
          .then(async (res) => {
            if (!res.ok) return { id, evaluation: null };
            const evaluation = await res.json();
            return { id, evaluation };
          })
          .catch(() => ({ id, evaluation: null }))
      )
    ).then((results) => {
      const evalMap: Record<number, any> = {};
      results.forEach(({ id, evaluation }) => {
        evalMap[id] = evaluation;
      });
      setEvaluations(evalMap);
    });
  }, [search, collaborators, searchResults]);

  // Função para calcular status e nota do gestor
  function getStatusAndScore(collaboratorId: number) {
    const evaluation = evaluations[collaboratorId];
    const allCriteria = (evaluation?.groups || []).flatMap((g: any) => g.items || []);
    // Critérios com nota preenchida
    const withScore = allCriteria.filter((c: any) => c.score !== null && c.score !== undefined);
    // Critérios com nota E justificativa preenchidas
    const filled = allCriteria.filter((c: any) =>
      c.score !== null && c.score !== undefined && c.justification && c.justification.trim() !== ""
    );
    const total = allCriteria.length;
    let managerScore = null;
    if (withScore.length > 0) {
      managerScore = withScore.reduce((sum: number, c: any) => sum + (c.score || 0), 0) / withScore.length;
    }
    if (!evaluation || total === 0 || filled.length < total) {
      return { status: "Em andamento" as const, managerScore };
    }
    return { status: "Finalizado" as const, managerScore };
  }

  // Mostra searchResults se houver busca, senão lista completa
  const list = search.trim() !== "" ? searchResults : collaborators;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F6FA]">
      <div className="h-[20px] w-full" />
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight ml-0 pl-8">
        Colaboradores
      </h1>
      <div className="h-[60px] w-full" />
      <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white/50 mt-0 mb-4">
        <input
          type="text"
          placeholder="Buscar por colaboradores"
          className="flex-1 outline-none text-sm font-normal text-[#1D1D1D]/75 placeholder:text-[#1D1D1D]/50 bg-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-teal-700 text-white p-2 rounded-md">
          <img src={searchIcon} alt="Buscar" className="w-5 h-5" />
        </button>
      </div>
      {/* Container de resultados sem overflow horizontal */}
      <div className="flex flex-col gap-4 w-full px-8">
        {list.length > 0 ? (
          list.map((collaborator) => {
            const { status, managerScore } = getStatusAndScore(collaborator.id);
            return (
              <CollaboratorCard
                key={collaborator.id}
                collaborator={{
                  ...collaborator,
                  status,
                  managerScore,
                }}
              />
            );
          })
        ) : (
          <p className="text-sm text-[#1D1D1D]/50 p-2">
            Nenhum colaborador encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
