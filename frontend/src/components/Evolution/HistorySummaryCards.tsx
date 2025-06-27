import React from 'react';

interface HistorySummaryCardsProps {
  currentScore: number;
  growth: number;
  totalEvaluations: number;
}

const HistorySummaryCards: React.FC<HistorySummaryCardsProps> = ({ currentScore, growth, totalEvaluations }) => (
  <div className="grid grid-cols-3 gap-4 mb-8">
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <span className="text-gray-500 text-sm">Nota atual</span>
      <span className="text-3xl font-bold text-green-600">{currentScore}</span>
      <span className="text-xs text-gray-400">Nota final do ciclo mais recente</span>
    </div>
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <span className="text-gray-500 text-sm">Crescimento</span>
      <span className="text-3xl font-bold text-orange-500">↑ {growth}</span>
      <span className="text-xs text-gray-400">Comparado ao ciclo anterior</span>
    </div>
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <span className="text-gray-500 text-sm">Avaliações realizadas</span>
      <span className="text-3xl font-bold text-blue-600">{totalEvaluations}</span>
      <span className="text-xs text-gray-400">Total de avaliações</span>
    </div>
  </div>
);

export default HistorySummaryCards; 