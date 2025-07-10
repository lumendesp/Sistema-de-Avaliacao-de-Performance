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
  return value === "-" ? undefined : parseFloat(value);
};

const EvaluationCyclesList: React.FC<EvaluationCyclesListProps> = ({ cycles }) => {
  console.log("Ciclos recebidos:", cycles);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <span className="text-gray-700 font-semibold">Ciclos de Avaliação</span>
      <div className="mt-4 flex flex-col gap-6">
        {cycles.map((cycle) => (
          <EvaluationCycleCard
            key={cycle.cycle}
            cycle={cycle.cycle}
            status={cycle.status}
            selfEvaluation={parseScore(cycle.self)}
            peerEvaluation={parseScore(cycle.exec)}
            finalScore={parseScore(cycle.final)}
            summary={cycle.summary}
          />
        ))}
      </div>
    </div>
  );
};

export default EvaluationCyclesList;
