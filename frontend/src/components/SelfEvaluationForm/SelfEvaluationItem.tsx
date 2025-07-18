import { useState } from "react";
import { FaChevronUp, FaChevronDown, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import type { SelfEvaluationItemProps } from "../../types/selfEvaluation";
import StarRating from "../StarRating";
import ScoreBox from "../ScoreBox";
import { Tooltip } from "react-tooltip";
import 'react-tooltip/dist/react-tooltip.css';

const SelfEvaluationItem = ({
  index,
  title,
  description,
  score,
  justification,
  setScore,
  setJustification,
  readOnly = false,
}: SelfEvaluationItemProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const isComplete = score > 0 && justification.trim().length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <FaCheckCircle className="text-green-600 w-5 h-5" title="Critério respondido" />
          ) : (
            <div
              className="w-5 h-5 flex items-center justify-center rounded-full border border-black text-xs text-black"
              title={`Questão ${index}`}
            >
              {index}
            </div>
          )}

          <div className="flex items-center gap-3 font-semibold text-sm sm:text-base">
            <span>{title}</span>
            {description && (
              <>
                <FaInfoCircle
                  data-tooltip-id={`tooltip-${index}`}
                  data-tooltip-content={description}
                  className="text-green-main hover:text-gray-600 cursor-pointer w-4.5 h-4.5"
                />
                <Tooltip
                  id={`tooltip-${index}`}
                  place="top"
                  className="bg-gray-800 text-white px-2 py-1 rounded text-sm"
                />
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ScoreBox score={score} />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-gray-100 transition"
          >
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <p className="text-sm sm:text-base text-gray-500">
            {readOnly
              ? "Nota atribuída ao critério:"
              : "Dê uma avaliação de 1 a 5 com base no critério"}
          </p>

          <StarRating
            score={score}
            onChange={(newScore) => {
              if (!readOnly) setScore(newScore);
            }}
          />

          <div>
            <label
              htmlFor={`justification-${index}`}
              className="block text-sm mb-1 text-gray-600"
            >
              Justifique sua nota
            </label>
            <textarea
              id={`justification-${index}`}
              className="w-full border rounded-md px-3 py-2 text-sm sm:text-base focus:outline-[#08605e4a]"
              rows={3}
              placeholder="Justifique sua nota"
              value={justification}
              onChange={(e) => {
                if (!readOnly) setJustification(e.target.value);
              }}
              disabled={readOnly}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SelfEvaluationItem;
  