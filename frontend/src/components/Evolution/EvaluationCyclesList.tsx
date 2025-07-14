import React from 'react';
import EvaluationCycleCard from './EvaluationCycleCard';

interface Cycle {
  cycle: string;
  status: string;
  self: string;
  exec: string;
  final: string;
  summary: string;
}

interface EvaluationCyclesListProps {
  cycles: Cycle[];
}

const parseScore = (value: string): number | undefined => {
  return value === '-' ? undefined : parseFloat(value);
};

const getEvaluationColor = (score?: number): string => {
  if (score === undefined) return '#E5E7EB'; // cinza claro
  if (score >= 4.5) return '#065F46'; // verde escuro
  if (score >= 4.0) return '#0F766E'; // teal escuro
  if (score >= 3.0) return '#CA8A04'; // amarelo escuro
  return '#DC2626'; // vermelho
};

const EvaluationCyclesList: React.FC<EvaluationCyclesListProps> = ({ cycles }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <span className="text-gray-700 font-semibold">Ciclos de Avaliação</span>
      <div className="mt-4 flex flex-col gap-6">
        {cycles.map((cycle) => {
          const selfScore = parseScore(cycle.self);
          const peerScore = parseScore(cycle.exec);
          const finalScore = parseScore(cycle.final);

          return (
            <EvaluationCycleCard
              key={cycle.cycle}
              cycle={cycle.cycle}
              status={cycle.status}
              selfEvaluation={selfScore}
              peerEvaluation={peerScore}
              finalScore={finalScore}
              summary={cycle.summary}
              selfColor={getEvaluationColor(selfScore)}
              peerColor={getEvaluationColor(peerScore)}
              finalColor={getEvaluationColor(finalScore)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EvaluationCyclesList;
