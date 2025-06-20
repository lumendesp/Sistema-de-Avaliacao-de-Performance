import { useState } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import type { EvaluationComparisonItemProps } from '../../types/evaluationComparison';
import StarRating from '../StarRating';
import ScoreBox from '../ScoreBox';

const EvaluationComparisonItem = ({
  index,
  title,
  selfScore,
  finalScore,
  setSelfScore,
  justification,
  setJustification,
}: EvaluationComparisonItemProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center rounded-full border text-xs">
            {index}
          </div>
          <p className="font-semibold">{title}</p>
        </div>

        {/* Badges de média por critério */}
        <div className="flex items-center gap-3">
          <ScoreBox score={finalScore} />
          <ScoreBox score={selfScore} />
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>
      </div>

      {/* Conteúdo colapsável */}
      {isOpen && (
        <div className="space-y-4">
          {/* Bloco de estrelas dupla */}
          <div className="flex flex-col md:flex-row md:items-start md:gap-6">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">
                Sua avaliação (1 a 5)
              </p>
              <StarRating score={selfScore} onChange={setSelfScore} />
            </div>

            <div className="hidden md:block w-px bg-gray-300 mx-4" />

            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">Avaliação final</p>
              <StarRating score={finalScore} onChange={() => {}} />
            </div>
          </div>

          {/* Justificativa */}
          <div>
            <label
              htmlFor={`just-${index}`}
              className="block text-sm text-gray-600 mb-1"
            >
              Justifique sua nota
            </label>
            <textarea
              id={`just-${index}`}
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              placeholder="Escreva aqui..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationComparisonItem;
