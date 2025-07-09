import { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import type { SelfEvaluationItemProps } from '../../../types/selfEvaluation';
import StarRatingReadOnly from '../../StarRatingReadOnly';
import ScoreBox from '../../ScoreBox';

const SelfEvaluationItemReadOnly = ({
  index,
  title,
  description,
  score,
  justification,
}: Omit<SelfEvaluationItemProps, 'setScore' | 'setJustification'>) => {
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
          <ScoreBox score={score} />
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div> 
      </div>

      {isOpen && (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1 font-medium">
              Avaliação de 1 a 5 com base no critério
            </p>
            <StarRatingReadOnly score={score} dimmed />
          </div>

          {description && (
            <p className="text-xs italic text-gray-500 mt-2">{description}</p>
          )}

          <div>
            <label
              htmlFor={`justification-${index}`}
              className="block text-sm mb-1 text-gray-600"
            >
              Justificativa
            </label>
            <textarea
              id={`justification-${index}`}
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

export default SelfEvaluationItemReadOnly;
