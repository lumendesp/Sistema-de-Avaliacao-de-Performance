import { useNavigate } from 'react-router-dom';
import { PiSparkleBold } from 'react-icons/pi';
import type { EvaluationCardMiniProps } from '../../types/DashboardCollaboratorTypes/evaluationCardMini';
import { getEvaluationColor } from '../../utils/getEvaluationColor';

const EvaluationCardMini = ({
  ciclo,
  nota,
  status,
  statusReal, 
  resumo,
  destaque
}: EvaluationCardMiniProps) => {
  const navigate = useNavigate();
  const notaColor = getEvaluationColor(nota);

  const handleClick = () => {
    if (statusReal === 'IN_PROGRESS_COLLABORATOR') {
      navigate('/collaborator/evaluation');
    } else {
      navigate('/collaborator/evaluation-comparison', {
        state: {
          selectedCycleName: ciclo,
        },
      });
    }
  };

  const statusClass =
    status === 'Finalizado'
      ? 'bg-green-100 text-green-700'
      : 'bg-yellow-100 text-yellow-700';

  return (
    <button onClick={handleClick} className="w-full text-left">
      <div className="flex rounded-xl items-center border border-gray-200 bg-white p-4 gap-4 shadow-sm hover:shadow-md transition">
        <div className="flex flex-col justify-center items-center bg-gray-50 px-4 py-2 rounded-md min-w-[72px] h-full">
          <div className="flex flex-col items-center">
            <span className={`text-xl sm:text-2xl font-bold leading-tight ${notaColor}`}>
              {nota !== undefined ? nota.toFixed(1) : '-'}
            </span>
            {destaque && (
              <span className={`text-xs sm:text-sm font-medium ${notaColor}`}>
                {destaque}
              </span>
            )}
          </div>
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
    </button>
  );
};

export default EvaluationCardMini;
