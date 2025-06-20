import { useState } from 'react';
import EvaluationComparisonItem from './ComparisonEvaluationItem';
import ScoreBox from '../ScoreBox';
import type { EvaluationComparisonFormProps } from '../../types/evaluationComparison';

const EvaluationComparisonForm = ({ title, criteria }: EvaluationComparisonFormProps) => {
  const [selfScores, setSelfScores] = useState<number[]>(Array(criteria.length).fill(0));
  const [finalScores] = useState<number[]>(Array(criteria.length).fill(4)); // exemplo fixo
  const [justifs, setJustifs] = useState<string[]>(Array(criteria.length).fill(''));

  const handleSelfScore = (idx: number, v: number) => {
    const clone = [...selfScores];
    clone[idx] = v;
    setSelfScores(clone);
  };

  const handleJustif = (idx: number, v: string) => {
    const clone = [...justifs];
    clone[idx] = v;
    setJustifs(clone);
  };

  const avgSelf = selfScores.reduce((s, v) => s + v, 0) / criteria.length;
  const avgFinal = finalScores.reduce((s, v) => s + v, 0) / criteria.length;

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-bg font-semibold text-green-main">{title}</h3>
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
            setSelfScore={(v) => handleSelfScore(idx, v)}
            justification={justifs[idx]}
            setJustification={(v) => handleJustif(idx, v)}
          />
        ))}
      </div>
    </div>
  );
};

export default EvaluationComparisonForm;
