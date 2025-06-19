import React from 'react';
import EvaluationCycleCard from './EvaluationCycleCard';

interface Cycle {
  cycle: string;
  status: string;
  self: string | number;
  exec: string | number;
  posture: string | number;
  final: string | number;
  summary: string;
}

interface EvaluationCyclesListProps {
  cycles: Cycle[];
}

const EvaluationCyclesList: React.FC<EvaluationCyclesListProps> = ({ cycles }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <span className="text-gray-700 font-semibold">Ciclos de Avaliação</span>
    <div className="mt-4 flex flex-col gap-6">
      {cycles.map((cycle) => (
        <EvaluationCycleCard key={cycle.cycle} {...cycle} />
      ))}
    </div>
  </div>
);

export default EvaluationCyclesList; 