import React from "react";
import HistorySummaryCards from '../components/Evolution/HistorySummaryCards';
import PerformanceChart from '../components/Evolution/PerformanceChart';
import EvaluationCyclesList from '../components/Evolution/EvaluationCyclesList';

interface Performance {
  cycle: string;
  score: number;
}

interface Cycle {
  cycle: string;
  status: string;
  self: number | string;
  exec: number | string;
  posture: number | string;
  final: number | string;
  summary: string;
}

interface EvolutionLayoutProps {
  title: string;
  currentScore: number;
  growth: number;
  totalEvaluations: number;
  performance: Performance[];
  cycles: Cycle[];
}

const EvolutionLayout: React.FC<EvolutionLayoutProps> = ({
  title,
  currentScore,
  growth,
  totalEvaluations,
  performance,
  cycles,
}) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <HistorySummaryCards
      currentScore={currentScore}
      growth={growth}
      totalEvaluations={totalEvaluations}
    />
    <PerformanceChart performance={performance} />
    <EvaluationCyclesList cycles={cycles} />
  </div>
);

export default EvolutionLayout; 