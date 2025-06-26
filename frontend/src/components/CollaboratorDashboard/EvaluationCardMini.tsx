import { Link } from 'react-router-dom';
import { PiSparkleBold } from 'react-icons/pi';
import type { EvaluationCardMiniProps } from '../../types/DashboardCollaboratorTypes/evaluationCardMini';
import { getEvaluationColor } from '../../utils/getEvaluationColor';

const EvaluationCardMini = ({ ciclo, nota, status, resumo, destaque }: EvaluationCardMiniProps) => {
  const statusClass =
    status === 'Finalizado'
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700';

  const notaColor = getEvaluationColor(nota);

  return (
    <Link to="/collaborator/evaluation-comparison" className="block">
      <div className="flex rounded-xl border border-gray-200 bg-white p-4 gap-4 items-start shadow-sm hover:shadow-md transition">
        <div className="flex flex-col items-center justify-center bg-gray-50 px-4 py-2 rounded-md min-w-[72px]">
          <span className={`text-2xl font-bold ${notaColor}`}>
            {nota !== undefined ? nota.toFixed(1) : '-'}
          </span>
          {destaque && (
            <span className={`text-sm font-semibold ${notaColor}`}>{destaque}</span>
          )}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-800">Ciclo {ciclo}</span>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusClass}`}>
              {status}
            </span>
          </div>
          {resumo && (
            <div className="flex items-start gap-2 bg-gray-100 px-3 py-2 rounded-md">
              <PiSparkleBold className="text-green-800 mt-[2px]" size={14} />
              <div>
                <p className="text-xs font-semibold text-gray-700">Resumo</p>
                <p className="text-xs text-gray-600 leading-snug">{resumo}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EvaluationCardMini;
