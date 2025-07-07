import { useNavigate } from 'react-router-dom';
import { statusConfig } from '../../utils/statusConfig';
import type { EvaluationStatusButtonProps } from '../../types/evaluationStatusButton';
import Arrow from '../../assets/arrow.svg';

function EvaluationStatusButton({
  status,
  ciclo,
  diasRestantes,
  className = '',
  ...props
}: EvaluationStatusButtonProps) {
  const { bg, text, subtitle, iconColor, textColor } = statusConfig[status];
  const navigate = useNavigate();

  const handleClick = () => {
    if (status === 'aberto') {
      navigate('/collaborator/evaluation');
    } else {
      navigate('/collaborator/evaluation-comparison');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-between p-6 rounded-lg transition-colors duration-200 shadow-sm ${bg} ${text} ${className}`}
      {...props}
    >
      <div className="flex items-start gap-3 text-left">
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={iconColor}
        >
          <path
            d="M34.5 9.58337L29.8732 4.95654C29.1544 4.2376 28.1796 3.83359 27.163 3.83337H11.5C10.4833 3.83337 9.50831 4.23724 8.78942 4.95613C8.07053 5.67502 7.66666 6.65004 7.66666 7.66671V38.3334C7.66666 39.35 8.07053 40.3251 8.78942 41.0439C9.50831 41.7628 10.4833 42.1667 11.5 42.1667H34.5C35.5167 42.1667 36.4917 41.7628 37.2106 41.0439C37.9295 40.3251 38.3333 39.35 38.3333 38.3334"
            stroke="currentColor"
            strokeWidth="3.83333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M40.9745 24.1999C41.738 23.4364 42.1669 22.4008 42.1669 21.321C42.1669 20.2413 41.738 19.2057 40.9745 18.4422C40.211 17.6787 39.1754 17.2498 38.0957 17.2498C37.0159 17.2498 35.9803 17.6787 35.2168 18.4422L27.531 26.1319C27.0753 26.5873 26.7418 27.1503 26.5612 27.7687L24.9569 33.2695C24.9088 33.4345 24.9059 33.6093 24.9486 33.7757C24.9912 33.9421 25.0778 34.094 25.1993 34.2155C25.3207 34.337 25.4726 34.4236 25.6391 34.4662C25.8055 34.5089 25.9803 34.506 26.1452 34.4579L31.6461 32.8536C32.2645 32.673 32.8275 32.3395 33.2829 31.8838L40.9745 24.1999Z"
            stroke="currentColor"
            strokeWidth="3.83333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.3333 34.5H17.25"
            stroke="currentColor"
            strokeWidth="3.83333"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div>
          <p className={`font-semibold ${textColor}`}>
            Ciclo {ciclo} de avaliação {status === 'aberto' ? 'está aberto' : 'finalizado'}
          </p>
          <p className={`text-sm opacity-80 ${textColor}`}>
            {subtitle(diasRestantes)}
          </p>
        </div>
      </div>
      <img src={Arrow} alt="Seta para a direita" className="h-15 w-15" />
    </button>
  );
}

export default EvaluationStatusButton;
