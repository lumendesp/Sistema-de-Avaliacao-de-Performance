import React from "react";
import arrowIcon from "../assets/arrowRight.png";
import type { Props } from "../types/collaboratorStatus.tsx";

export default function CollaboratorCard({ collaborator }: Props) {
  const { name, role, status, selfScore, managerScore } = collaborator;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Em andamento":
        return "bg-yellow-200 text-yellow-700";
      case "Finalizado":
        return "bg-green-200 text-green-700";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  const handleClick = () => {
    // Coloque aqui o que deve acontecer ao clicar no card (ex: navegação)
    console.log("Card clicado:", name);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left bg-white rounded-xl p-4 flex items-center shadow justify-between hover:bg-gray-100 transition cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
          {initials}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${getStatusStyle(status)}`}>
          {status}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#1D1D1DBF]">Autoavaliação</span>
          <span className="bg-gray-200 px-2 py-1 rounded text-sm font-semibold text-gray-800 w-12 text-center">
            {selfScore.toFixed(1)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-[#1D1D1DBF]">Nota gestor</span>
          {managerScore !== null ? (
            <span className="bg-gray-200 px-2 py-1 rounded text-sm font-semibold text-gray-800 w-12 text-center">
              {managerScore.toFixed(1)}
            </span>
          ) : (
            <span className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-500 w-12 text-center">
              -
            </span>
          )}
        </div>

        <img src={arrowIcon} alt="Detalhes" className="w-5 h-5" />
      </div>
    </button>
  );
}
