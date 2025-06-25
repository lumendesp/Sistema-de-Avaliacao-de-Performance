import { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import type { EvaluationComparisonItemProps } from '../../types/evaluationComparison';
import StarRatingReadOnly from '../StarRatingReadOnly';
import ScoreBox from '../ScoreBox';

const EvaluationComparisonItem = ({
  index,
  title,
  selfScore,
  finalScore,
  justification,
}: EvaluationComparisonItemProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center rounded-full border text-xs text-gray-600">
            {index}
          </div>
          <p className="font-semibold text-gray-800">{title}</p>
        </div>
        <div className="flex items-center gap-3">
          <ScoreBox score={finalScore} />
          <ScoreBox score={selfScore}/>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-start md:gap-6">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1 font-medium">
                Sua avaliação de 1 a 5 com base no critério
              </p>
              <StarRatingReadOnly score={selfScore} dimmed />
            </div>

            <div className="hidden md:block w-px bg-gray-300 mx-4" />

            <div className="flex-1">
              <p className="text-xs text-gray-700 mb-1 font-medium">Avaliação final</p>
              <StarRatingReadOnly score={finalScore} />
            </div>
          </div>

          <div>
            <label
              htmlFor={`just-${index}`}
              className="block text-sm mb-1 text-gray-600"
            >
              Justificativa
            </label>
            <textarea
              id={`just-${index}`}
              className="w-full border rounded-md p-2 text-sm text-gray-700 bg-gray-50"
              rows={3}
              disabled
              value={justification}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationComparisonItem;
