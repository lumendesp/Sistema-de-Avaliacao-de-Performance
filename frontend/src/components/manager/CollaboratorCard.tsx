import React from "react";
import arrowIcon from "../../assets/arrowRight.png";
import type { Props } from "../../types/collaboratorStatus.tsx";
import { useNavigate } from "react-router-dom";

export default function CollaboratorCard({ collaborator }: Props) {
  const { id, name, role, status, selfScore, managerScore } = collaborator;
  const navigate = useNavigate();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Em andamento":
        return "bg-yellow-200 text-yellow-700";
      case "Finalizado":
        return "bg-green-200 text-green-700";
      case "Pendente":
        return "bg-red-200 text-red-700";
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
    navigate(`/manager/avaliacao/${id}`); // Corrigido para rota correta
  };

  return (
    <button
      onClick={handleClick}
      className="w-full max-w-full text-left bg-white rounded-xl p-3 flex flex-col sm:flex-row sm:items-center shadow justify-between hover:bg-gray-100 transition cursor-pointer gap-2 sm:gap-0 overflow-x-hidden"
    >
      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto max-w-full">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-700">
          {initials}
        </div>
        <div className="min-w-0 max-w-[120px] sm:max-w-none">
          <p className="font-semibold truncate max-w-full">{name}</p>
          <p className="text-xs sm:text-sm text-gray-500">COLABORADOR</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded ${getStatusStyle(
            status
          )} ml-auto sm:ml-0`}
        >
          {status}
        </span>
      </div>

      <div className="flex flex-row sm:flex-row items-center sm:items-center gap-2 sm:gap-4 w-full sm:w-auto mt-2 sm:mt-0 max-w-full justify-center sm:justify-start">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <span className="text-[#1D1D1DBF]">Autoavaliação</span>
          <span className="bg-gray-200 px-2 py-1 rounded text-xs sm:text-sm font-semibold text-gray-800 w-12 text-center">
            {selfScore !== null ? selfScore.toFixed(1) : "-"}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          <span className="text-[#1D1D1DBF]">Nota gestor</span>
          {managerScore !== null ? (
            <span className="bg-gray-200 px-2 py-1 rounded text-xs sm:text-sm font-semibold text-gray-800 w-12 text-center">
              {managerScore.toFixed(1)}
            </span>
          ) : (
            <span className="bg-gray-200 px-2 py-1 rounded text-xs sm:text-sm text-gray-500 w-12 text-center">
              -
            </span>
          )}
        </div>

        <img
          src={arrowIcon}
          alt="Detalhes"
          className="w-5 h-5 ml-auto sm:ml-0"
        />
      </div>
    </button>
  );
}
