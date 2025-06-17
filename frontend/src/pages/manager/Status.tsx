import React from "react";
import searchIcon from "../../assets/search.png";
import CollaboratorCard from "../../components/CollaboratorCard.tsx";
import type { Collaborator } from "../../types/collaboratorStatus.tsx";

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
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar por colaboradores"
          className="flex-grow px-4 py-2 rounded-md bg-white shadow-sm border border-gray-300 focus:outline-none"
        />
        <button className="bg-teal-700 text-white p-2 rounded-md">
          <img src={searchIcon} alt="Buscar" className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {collaborators.map((collaborator) => (
          <CollaboratorCard key={collaborator.id} collaborator={collaborator} />
        ))}
      </div>
    </div>
  );
}
