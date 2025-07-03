import EvaluationComparisonItem from './ComparisonEvaluationItem';
import ScoreBoxComparison from './ScoreBoxComparison';
import type { EvaluationComparisonItemData } from '../../types/evaluationComparison';

interface Props {
  title: string;
  selfAverageScore: number;
  finalAverageScore: number;
  criteria: EvaluationComparisonItemData[];
}

const EvaluationComparisonForm = ({
  title,
  selfAverageScore,
  finalAverageScore,
  criteria,
}: Props) => {
  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-bg font-semibold text-green-main">{title}</h3>
        <div className="flex gap-4">
          <ScoreBoxComparison score={selfAverageScore} type="self-box" />
          <ScoreBoxComparison score={finalAverageScore} type="final-box" />
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
