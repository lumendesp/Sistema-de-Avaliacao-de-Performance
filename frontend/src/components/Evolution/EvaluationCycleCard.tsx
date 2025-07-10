import React from 'react';
import { FaStar } from 'react-icons/fa';
import AIIcon from "../../assets/committee/AI-icon.png";
import ColoredScoreBox from "./ColoredScoreBox";

interface EvaluationCycleCardProps {
  cycle: string;
  status: string;
  self: string | number;
  exec: string | number;
  posture: string | number;
  final: string | number;
  summary: string;
}

const getColor = (score: number) => {
  if (score >= 4) return '#08605F'; // verde
  if (score >= 3) return '#F5C130'; // amarelo
  return '#DC2626'; // vermelho
};

const ProgressBar = ({ value }: { value: number }) => (
  <div className="w-full h-2 bg-gray-200 rounded-full">
    <div
      className="h-2 rounded-full"
      style={{
        width: `${(value / 5) * 100}%`,
        backgroundColor: getColor(value),
      }}
    />
  </div>
);

const EvaluationCycleCard: React.FC<EvaluationCycleCardProps> = ({
  cycle,
  status,
  self,
  exec,
  posture,
  final,
  summary
}) => (
  <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">
    {/* Top info */}
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-800">Ciclo {cycle.replace(/^Ciclo\s*/i, "")}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${status === 'Finalizado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 font-medium">Nota final</span>
        <ColoredScoreBox score={Number(final)} />
      </div>

    </div>

    {/* Avaliações com barra */}
    <div className="flex flex-col sm:flex-row gap-4 text-sm">
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Autoavaliação</span>
          <span className="font-medium text-gray-800">{self}</span>
        </div>
        <ProgressBar value={Number(self)} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Avaliação final - Execução</span>
          <span className="font-medium text-gray-800">{exec}</span>
        </div>
        <ProgressBar value={Number(exec)} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-gray-600">Avaliação final - Postura</span>
          <span className="font-medium text-gray-800">{posture}</span>
        </div>
        <ProgressBar value={Number(posture)} />
      </div>
    </div>

    {/* Resumo estilo IA */}
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 border-l-4 border-l-[#08605F] pl-6">
      <div className="flex items-center gap-2 mb-2">
        <img src={AIIcon} alt="IA Icon" className="w-4 h-4" />
        <span className="text-sm font-semibold text-gray-700">Resumo</span>
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap">
        {summary || "Resumo não disponível."}
      </div>
    </div>
  </div>
);

export default EvaluationCycleCard;
