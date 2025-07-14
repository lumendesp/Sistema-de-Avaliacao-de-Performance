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
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center gap-2 mb-2">
        {/* Status do tópico */}
        {isFilled ? (
          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-500">
            <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
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
          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold text-sm border border-gray-300">
            {index + 1}
          </span>
        )}
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          {formatCriterionName(criterion.title)}
          {criterion.description && (
            <>
              <FaInfoCircle
                data-tooltip-id={`tooltip-crit-${index}`}
                data-tooltip-content={criterion.description}
                className="text-green-main hover:text-gray-600 cursor-pointer w-4.5 h-4.5"
              />
              <Tooltip
                id={`tooltip-crit-${index}`}
                place="top"
                className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
              />
            </>
          )}
        </h3>
        <span className="ml-auto font-semibold text-gray-700">
          {criterion.selfRating?.toFixed(1) ?? "-"}
        </span>
        <span className="ml-2 font-semibold text-teal-700">
          {criterion.managerRating && criterion.managerRating > 0
            ? criterion.managerRating.toFixed(1)
            : "-"}
        </span>
        <button
          className="ml-4 p-1 rounded hover:bg-gray-200 transition"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar critério" : "Abrir critério"}
        >
          {open ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </button>
      </div>
      {open && (
        <div className="flex flex-row gap-6 mb-4">
          {/* Autoavaliação */}
          <div className="flex-1 flex flex-col gap-2 items-start bg-gray-50 rounded p-3">
            <span className="text-[#1D1D1DBF] text-sm font-medium mb-1">
              Autoavaliação
            </span>
            <RatingStars value={criterion.selfRating} readOnly size={28} />
            <span className="text-xs text-gray-500 font-medium mt-1 mb-1 min-h-[20px]">
              {criterion.selfScoreDescription ? (
                <span className="italic">{criterion.selfScoreDescription}</span>
              ) : (
                <span className="invisible">placeholder</span>
              )}
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
          <div className="flex-1 flex flex-col gap-2 items-start bg-gray-50 rounded p-3">
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
                  : (e) => onChange?.({ managerJustification: e.target.value })
              }
              readOnly={readOnly}
            />
          </div>
        </div>
      )}
    </div>
  );
}
