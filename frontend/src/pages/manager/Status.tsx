import React, { useEffect, useState } from "react";
import searchIcon from "../../assets/search.png";
import CollaboratorCard from "../../components/manager/CollaboratorCard";
import type { Collaborator } from "../../types/collaboratorStatus.tsx";
import { API_URL } from '../../services/api';

export default function Collaborators() {
  const [search, setSearch] = useState("");
  const [colaboradores, setColaboradores] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColaboradores = async () => {
      try {
        const res = await fetch(`${API_URL}/user`);
        if (!res.ok) throw new Error('Erro ao buscar colaboradores');
        const users = await res.json();
        // Filtra apenas usuários com role COLLABORATOR
        const colaboradores = users.filter((user: any) =>
          user.roles.some((role: any) => role.role === 'COLLABORATOR')
        ).map((user: any) => ({
          id: user.id,
          name: user.name,
          role: user.position?.name || 'Colaborador',
          status: 'Em andamento',
          selfScore: null,
          managerScore: null,
        }));
        setColaboradores(colaboradores);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchColaboradores();
  }, []);

  const filtered = colaboradores.filter((collab) =>
    collab.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Carregando colaboradores...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#F5F6FA]">
      <div className="h-[20px] w-full" />
      <h1 className="text-3xl font-bold text-gray-900 tracking-tight ml-0 pl-8">
        Colaboradores
      </h1>
      <div className="h-[60px] w-full" />
      {/* Barra de busca com espaçamento maior do topo */}
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

      {/* Lista dos colaboradores com mais espaçamento */}
      <div
        className={
          search.trim() !== ""
            ? "absolute top-full mt-2 w-full bg-white rounded-xl shadow-md px-2 py-3 flex flex-col gap-4 z-10"
            : "flex flex-col gap-4 w-full"
        }
      >
        {search.trim() !== "" && (
          <p className="ml-2 text-sm font-semibold text-[#334155]">
            Resultados
          </p>
        )}
        {(search.trim() !== "" ? filtered : colaboradores).length > 0 ? (
          (search.trim() !== "" ? filtered : colaboradores).map(
            (collaborator) => (
              <CollaboratorCard
                key={collaborator.id}
                collaborator={collaborator}
              />
            )
          )
        ) : (
          <p className="text-sm text-[#1D1D1D]/50 p-2">
            Nenhum colaborador encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
