import React from 'react';

interface EvaluationCycleCardProps {
  cycle: string;
  status: string;
  self: string | number;
  exec: string | number;
  posture: string | number;
  final: string | number;
  summary: string;
}

const EvaluationCycleCard: React.FC<EvaluationCycleCardProps> = ({ cycle, status, self, exec, posture, final, summary }) => (
  <div className="border rounded p-4 bg-gray-50">
    <div className="flex items-center gap-4 mb-2">
      <span className="font-bold">Ciclo {cycle}</span>
      <span className={`text-xs px-2 py-1 rounded ${status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{status}</span>
      <span className="ml-auto font-bold text-lg">{final !== '-' ? final : ''}</span>
    </div>
    <div className="flex gap-4 text-sm mb-2">
      <span>Autoavaliação: <b>{self}</b></span>
      <span>Avaliação final - Execução: <b>{exec}</b></span>
      <span>Avaliação final - Postura: <b>{posture}</b></span>
    </div>
    <div className="text-xs text-gray-600">Resumo: {summary}</div>
  </div>
);

export default EvaluationCycleCard; 