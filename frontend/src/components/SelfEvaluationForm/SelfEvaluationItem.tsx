import { useState } from "react";
import { FaChevronUp, FaChevronDown, FaCheckCircle } from "react-icons/fa";
import type { SelfEvaluationItemProps } from "../../types/selfEvaluation";
import StarRating from "../StarRating";
import ScoreBox from "../ScoreBox";

const SelfEvaluationItem = ({
  index,
  title,
  score,
  setScore,
  justification,
  setJustification,
  readOnly = false,
}: SelfEvaluationItemProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const isComplete = score > 0 && justification.trim().length > 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
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
          <p className="font-semibold">{title}</p>
        </div>
        <div className="flex items-center gap-4">
          <ScoreBox score={score} />
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {readOnly
              ? "Nota atribuída ao critério:"
              : "Dê uma avaliação de 1 a 5 com base no critério"}
          </p>

          <StarRating score={score} onChange={readOnly ? () => {} : setScore} />

          <div>
            <label
              htmlFor={`justification-${index}`}
              className="block text-sm mb-1 text-gray-600"
            >
              Justifique sua nota
            </label>
            <textarea
              id={`justification-${index}`}
              className="w-full border rounded-md p-2 text-sm"
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
