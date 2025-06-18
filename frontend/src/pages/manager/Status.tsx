import React from "react";
import searchIcon from "../../assets/search.png";
import CollaboratorCard from "../../components/CollaboratorCard.tsx";
import type { Collaborator } from "../../types/collaboratorStatus.tsx";
import { useState } from "react";

const collaborators: Collaborator[] = [
  {
    id: 1,
    name: "Colaborador 1",
    role: "Product Design",
    status: "Em andamento",
    selfScore: 4.0,
    managerScore: null,
  },
  {
    id: 2,
    name: "Colaborador 2",
    role: "Product Design",
    status: "Em andamento",
    selfScore: 4.0,
    managerScore: null,
  },
  {
    id: 3,
    name: "Colaborador 3",
    role: "Desenvolvedor",
    status: "Em andamento",
    selfScore: 4.0,
    managerScore: null,
  },
  {
    id: 4,
    name: "Colaborador 4",
    role: "Product Owner",
    status: "Finalizado",
    selfScore: 4.0,
    managerScore: 4.5,
  },
  {
    id: 5,
    name: "Colaborador 5",
    role: "Scrum Master",
    status: "Finalizado",
    selfScore: 4.0,
    managerScore: 4.5,
  },
];

export default function Collaborators() {
  const [search, setSearch] = useState("");

  const filtered = collaborators.filter((collab) =>
    collab.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 w-full relative">
      {/* Barra de busca */}
      <div className="flex items-center gap-2 rounded-xl py-4 px-7 w-full bg-white/50">
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

      {/* Lista dos colaboradores */}
      {search.trim() !== "" && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-md px-2 py-3 flex flex-col gap-2 z-10">
          <p className="ml-2 text-sm font-semibold text-[#334155]">
            Resultados
          </p>

          {filtered.length > 0 ? (
            filtered.map((collaborator) => (
              <CollaboratorCard
                key={collaborator.id}
                collaborator={collaborator}
              />
            ))
          ) : (
            <p className="text-sm text-[#1D1D1D]/50 p-2">
              Nenhum colaborador encontrado.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
