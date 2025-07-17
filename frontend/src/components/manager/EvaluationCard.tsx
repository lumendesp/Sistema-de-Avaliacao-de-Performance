import React, { useState } from "react";
import RatingStars from "./RatingStars.tsx";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FaInfoCircle } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import type { EvaluationCriterion } from "../../types/EvaluationManager.tsx";

interface Props {
  criterion: EvaluationCriterion;
  index: number;
  onChange?: (updated: Partial<EvaluationCriterion>) => void;
  readOnly?: boolean;
}

// Função utilitária para formatar nomes de critérios
function formatCriterionName(name: string) {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function EvaluationCard({
  criterion,
  index,
  onChange,
  readOnly = false,
}: Props) {
  const [open, setOpen] = useState(true);
  // Considera preenchido se managerRating > 0 e há justificativa
  const isFilled =
    (criterion.managerRating ?? 0) > 0 &&
    (criterion.managerJustification?.trim().length ?? 0) > 0;

  return (
    <div className="border-t pt-4 mt-4 w-full max-w-full overflow-x-hidden">
      <div className="flex flex-col w-full max-w-full overflow-x-hidden">
        <div className="flex flex-row flex-wrap items-center w-full gap-2 mb-2 max-w-full overflow-x-hidden">
          {/* Status do tópico */}
          {isFilled ? (
            <span className="w-6 h-6 min-w-[1.5rem] min-h-[1.5rem] max-w-[1.5rem] max-h-[1.5rem] flex items-center justify-center rounded-full bg-green-500 shrink-0 grow-0">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 16 16"
                className="block"
              >
                <circle cx="8" cy="8" r="8" fill="#22c55e" />
                <path
                  d="M4 8.5l3 3 5-5"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : (
            <span className="w-6 h-6 min-w-[1.5rem] min-h-[1.5rem] max-w-[1.5rem] max-h-[1.5rem] flex items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold text-sm border border-gray-300 shrink-0 grow-0">
              {index + 1}
            </span>
          )}
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2 min-w-0 truncate">
              {formatCriterionName(criterion.title)}
            </h3>
            <div className="flex flex-row gap-2 min-w-0 flex-nowrap w-full sm:w-auto sm:ml-auto sm:justify-end justify-start">
              <span className="font-semibold text-gray-700 whitespace-nowrap">
                {criterion.selfRating?.toFixed(1) ?? "-"}
              </span>
              <span className="font-semibold text-teal-700 whitespace-nowrap">
                {criterion.managerRating && criterion.managerRating > 0
                  ? criterion.managerRating.toFixed(1)
                  : "-"}
              </span>
            </div>
          </div>
          <button
            className="ml-auto p-1 rounded hover:bg-gray-200 transition flex-shrink-0"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Fechar critério" : "Abrir critério"}
          >
            {open ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
          </button>
        </div>
        {open && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mb-4 w-full max-w-full overflow-x-hidden">
            {/* Autoavaliação */}
            <div className="flex-1 flex flex-col gap-2 items-start bg-gray-50 p-3">
              <span className="text-[#1D1D1DBF] text-sm font-medium mb-1">
                Autoavaliação
              </span>
              <RatingStars value={criterion.selfRating} readOnly size={28} />
              <span className="text-xs text-gray-500 font-medium mt-1 mb-1 min-h-[20px]">
                <span className="invisible">placeholder</span>
              </span>
              <span className="text-sm text-gray-500 font-medium mb-1 mt-[2px]">
                Justificativa
              </span>
              <textarea
                className="w-full p-2 text-sm border rounded min-h-[80px] bg-gray-100"
                value={criterion.selfJustification}
                readOnly
              />
            </div>
            {/* Avaliação do gestor */}
            <div className="flex-1 flex flex-col gap-2 items-start bg-gray-50 p-3">
              <span className="text-[#1D1D1DBF] text-sm font-medium mb-1">
                Sua avaliação de 1 à 5 com base no critério
              </span>
              <RatingStars
                value={criterion.managerRating ?? 0}
                onChange={
                  readOnly
                    ? undefined
                    : (val: number) => onChange?.({ managerRating: val })
                }
                size={28}
                readOnly={readOnly}
              />
              {/* Espaço reservado para alinhar com a descrição da nota da autoavaliação */}
              <span className="text-xs text-gray-500 font-medium mt-1 mb-1 min-h-[20px]">
                <span className="invisible">placeholder</span>
              </span>
              <span className="text-sm text-gray-500 font-medium mb-1 mt-[1px]">
                Justificativa
              </span>
              <textarea
                className="w-full p-2 text-sm border rounded min-h-[80px]"
                placeholder="Justifique sua nota"
                value={criterion.managerJustification || ""}
                onChange={
                  readOnly
                    ? undefined
                    : (e) =>
                        onChange?.({ managerJustification: e.target.value })
                }
                readOnly={readOnly}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
