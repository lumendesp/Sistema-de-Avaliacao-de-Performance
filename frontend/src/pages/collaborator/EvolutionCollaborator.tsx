import React from 'react';
import EvolutionLayout from '../../layouts/EvolutionLayout';

const collaboratorHistory = {
  currentScore: 3.9,
  growth: 0.1,
  totalEvaluations: 4,
  performance: [
    { cycle: '2023.1', score: 3.5 },
    { cycle: '2023.2', score: 3.7 },
    { cycle: '2024.1', score: 4.0 },
    { cycle: '2024.2', score: 3.9 },
  ],
  cycles: [
    {
      cycle: '2024.2',
      status: 'Em andamento',
      self: '-',
      exec: '-',
      posture: '-',
      final: '-',
      summary: '-',
    },
    {
      cycle: '2024.1',
      status: 'Finalizado',
      self: 4.0,
      exec: 3.8,
      posture: 4.1,
      final: 4.0,
      summary: 'Bom desempenho, continue assim!',
    },
    {
      cycle: '2023.2',
      status: 'Finalizado',
      self: 3.5,
      exec: 3.7,
      posture: 3.8,
      final: 3.7,
      summary: 'Pode melhorar a comunicação.',
    },
  ],
};

const EvolutionCollaborator = () => {
  return (
    <EvolutionLayout
      title="Evolução (Colaborador)"
      currentScore={collaboratorHistory.currentScore}
      growth={collaboratorHistory.growth}
      totalEvaluations={collaboratorHistory.totalEvaluations}
      performance={collaboratorHistory.performance}
      cycles={collaboratorHistory.cycles}
    />
  );
};

export default EvolutionCollaborator; 