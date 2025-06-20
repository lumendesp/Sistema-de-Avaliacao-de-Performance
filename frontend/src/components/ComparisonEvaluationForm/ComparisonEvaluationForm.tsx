import EvaluationComparisonItem from './ComparisonEvaluationItem';
import ScoreBox from '../ScoreBox';
import type { EvaluationComparisonFormProps } from '../../types/evaluationComparison';

const EvaluationComparisonForm = ({ title, criteria }: EvaluationComparisonFormProps) => {
  const selfScores = [3.5, 4.0, 3.0];
  const finalScores = [4.0, 4.0, 4.0];
  const justifications = [
    'Me mostrei resiliente em situações complicadas',
    'Busquei apoio e mantive consistência',
    'Contribuí na organização de entregas',
  ];

  const avgSelf = selfScores.reduce((s, v) => s + v, 0) / criteria.length;
  const avgFinal = finalScores.reduce((s, v) => s + v, 0) / criteria.length;

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-semibold text-green-main">{title}</h3>
        <div className="flex gap-4">
          <ScoreBox score={avgFinal} />
          <ScoreBox score={avgSelf} />
        </div>
      </div>

      <div className="space-y-6">
        {criteria.map((c, idx) => (
          <EvaluationComparisonItem
            key={idx}
            index={idx + 1}
            title={c.title}
            selfScore={selfScores[idx]}
            finalScore={finalScores[idx]}
            justification={justifications[idx]}
            setSelfScore={() => {}}
            setJustification={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default EvaluationComparisonForm;
