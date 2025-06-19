import React from 'react';
import EvolutionLayout from '../../layouts/EvolutionLayout';

const History = {
  currentScore: 4.3,
  growth: 0.2,
  totalEvaluations: 5,
  performance: [
    { cycle: '2023.1', score: 3.8 },
    { cycle: '2023.2', score: 4.0 },
    { cycle: '2024.1', score: 4.1 },
    { cycle: '2024.2', score: 4.5 },
    { cycle: '2025.1', score: 4.3 },
  ],
  cycles: [
    {
      cycle: '2025.1',
      status: 'Em andamento',
      self: '-',
      exec: '-',
      posture: '-',
      final: '-',
      summary: '-',
    },
    {
      cycle: '2024.2',
      status: 'Finalizado',
      self: 4.0,
      exec: 5.0,
      posture: 4.2,
      final: 4.5,
      summary: 'Você se saiu muito bem por conta disso e isso',
    },
    {
      cycle: '2024.1',
      status: 'Finalizado',
      self: 4.0,
      exec: 4.5,
      posture: 4.1,
      final: 4.1,
      summary: 'Você se saiu muito bem por conta disso e isso',
    },
    {
      cycle: '2023.2',
      status: 'Finalizado',
      self: 3.5,
      exec: 4.0,
      posture: 3.8,
      final: 3.8,
      summary: 'Desempenho médio, dá para melhorar isso',
    },
  ],
};

const MyEvolution = () => {
  return (
    <EvolutionLayout
      title="Minha Evolução"
      currentScore={History.currentScore}
      growth={History.growth}
      totalEvaluations={History.totalEvaluations}
      performance={History.performance}
      cycles={History.cycles}
    />
  );
};

export default MyEvolution; 