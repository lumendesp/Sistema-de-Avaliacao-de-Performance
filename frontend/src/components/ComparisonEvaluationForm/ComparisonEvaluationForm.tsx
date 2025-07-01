import EvaluationComparisonItem from './ComparisonEvaluationItem';
import ScoreBoxComparison from './ScoreBoxComparison';
import type { EvaluationComparisonItemData } from '../../types/evaluationComparison';

interface Props {
  title: string;
  criteria: EvaluationComparisonItemData[];
}

const EvaluationComparisonForm = ({ title, criteria }: Props) => {
  const avgSelf = criteria.reduce((sum, c) => sum + (c.selfScore ?? 0), 0) / criteria.length;
  const avgFinal = criteria.reduce((sum, c) => sum + (c.finalScore ?? 0), 0) / criteria.length;

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-bg font-semibold text-green-main">{title}</h3>
        <div className="flex gap-4">
          <ScoreBoxComparison score={avgSelf} type='self-box' />
          <ScoreBoxComparison score={avgFinal} type="final-box" />
        </div>
      </div>

      <div className="space-y-6">
        {criteria.map((c, idx) => (
          <EvaluationComparisonItem
            key={idx}
            index={idx + 1}
            title={c.title}
            selfScore={c.selfScore}
            finalScore={c.finalScore}
            justification={c.justification}
          />
        ))}
      </div>
    </div>
  );
};

export default EvaluationComparisonForm;
