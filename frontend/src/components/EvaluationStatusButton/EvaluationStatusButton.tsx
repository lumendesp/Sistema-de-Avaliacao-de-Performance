import { useNavigate } from 'react-router-dom';
import { statusConfig } from '../../utils/statusConfig';
import type { EvaluationStatusButtonProps } from '../../types/evaluationStatusButton';
import Arrow from '../../assets/arrow.svg';

function EvaluationStatusButton({
  status,
  ciclo,
  diasRestantes,
  className = '',
  context = 'collaborator', // novo prop, default 'collaborator'
  originalStatus,
  ...props
}: EvaluationStatusButtonProps & { context?: 'collaborator' | 'manager' | 'mentor', originalStatus?: string }) {
  const { bg, text, subtitle, iconColor, textColor } = statusConfig[status];
  const navigate = useNavigate();

  const isManager = context === 'manager' || context === 'mentor';
  const isColabCycle = status === 'aberto';
  const isManagerCycle = status === 'emBreve';

  // Ajuste de cor para texto e fundo no manager ciclo gestor
  // Ajuste para ciclo gestor aberto só se originalStatus for IN_PROGRESS_MANAGER
  const isManagerGestorCycle = (context === 'manager' || context === 'mentor') && originalStatus === 'IN_PROGRESS_MANAGER';
  const isManagerClosedCycle = (context === 'manager' || context === 'mentor') && (originalStatus === 'CLOSED' || originalStatus === 'IN_PROGRESS_COMMITTEE');
  const abertoConfig = statusConfig['aberto'];
  const effectiveButtonBg = isManagerGestorCycle ? abertoConfig.bg : ((context === 'manager' || context === 'mentor') ? 'bg-white' : bg);
  const effectiveTextColor = isManagerGestorCycle ? abertoConfig.text : ((context === 'manager' || context === 'mentor') ? 'text-gray-900' : textColor);
  const effectiveSubtitleColor = isManagerGestorCycle ? abertoConfig.text : ((context === 'manager' || context === 'mentor') ? 'text-gray-700' : textColor);
  const effectiveIconColor = isManagerGestorCycle ? abertoConfig.text : ((context === 'manager' || context === 'mentor') ? 'text-gray-400' : iconColor);

  const handleClick = () => {
    if (status === 'disponivel') {
      if (context === 'manager') {
        navigate('/manager/brutal-facts');
      } else if (context === 'mentor') {
        navigate('/mentor/brutal-facts');
      } else {
        navigate('/collaborator/progress');
      }
      return;
    }
    if (isManager) {
      if (isColabCycle) {
        // Agora redireciona para a autoavaliação do colaborador
        navigate('/collaborator/evaluation');
        return;
      } else if (isManagerCycle) {
        navigate('/manager/collaborators');
        return;
      }
    } else {
      // colaborador
      if (status === 'aberto') {
        navigate('/collaborator/evaluation');
      } else {
        navigate('/collaborator/evaluation-comparison', {
          state: { selectedCycleName: ciclo },
        });
      }
    }
  };

  // O botão deve ficar desabilitado se for ciclo gestor finalizado para manager ou se não for nenhum ciclo ativo
  const isButtonDisabled = (isManager && isManagerClosedCycle) ? true : false;

  return (
    <button
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`w-full flex items-center justify-between p-6 rounded-lg transition-colors duration-200 shadow-sm ${effectiveButtonBg} ${effectiveTextColor} ${className} ${isButtonDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      {...props}
    >
      <div className="flex items-start gap-3 text-left">
        <svg
          viewBox="0 0 46 46"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`hidden md:block w-10 h-10 md:w-[46px] md:h-[46px] ${effectiveIconColor}`}
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
          {/* Título customizado para ciclo colaborador aberto no manager */}
          {status === 'disponivel' ? (
            <>
              <p className={`font-semibold text-sm md:text-base ${effectiveTextColor}`}>
                Resultados divulgados
              </p>
              <p className={`text-sm opacity-80 ${effectiveSubtitleColor}`}>
                {isManager ? 'Veja os Brutal Facts do ciclo' : 'Veja os seus resultados no ciclo'}
              </p>
            </>
          ) : isManager && isColabCycle ? (
            <>
              <p className={`font-semibold text-sm md:text-base ${effectiveTextColor}`}>
                Ciclo de colaborador 2025.1 está aberto
              </p>
              <p className={`text-sm opacity-80 ${effectiveSubtitleColor}`}>
                {subtitle(diasRestantes)}
              </p>
              <span className="block text-xs text-yellow-700 mt-1 font-semibold">
                Aguarde o início do ciclo de gestor.
              </span>
            </>
          ) : isManagerGestorCycle ? (
            <>
              <p className={`font-semibold text-sm md:text-base ${effectiveTextColor}`}>
                {context === 'mentor' ? 'Ciclo de mentor' : 'Ciclo de gestor'} {ciclo} está aberto
              </p>
              <p className={`text-sm opacity-80 ${effectiveSubtitleColor}`}>
                {statusConfig['aberto'].subtitle(diasRestantes)}
              </p>
            </>
          ) : isManagerClosedCycle ? (
            <>
              <p className={`font-semibold text-sm md:text-base ${effectiveTextColor}`}>
                Ciclo atual foi fechado
              </p>
              <span className="block text-xs text-yellow-700 mt-1 font-semibold">
                Aguarde a divulgação dos resultados.
              </span>
            </>
          ) : (
            <>
              <p className={`font-semibold text-sm md:text-base ${effectiveTextColor}`}>
                Ciclo {ciclo} de avaliação {status === 'aberto' ? 'está aberto' : 'finalizado'}
              </p>
              <p className={`text-sm opacity-80 ${effectiveSubtitleColor}`}>
                {subtitle(diasRestantes)}
              </p>
              {isManager && isColabCycle && (
                <span className="block text-xs text-yellow-700 mt-1 font-semibold">Ciclo de colaboradores em andamento</span>
              )}
            </>
          )}
        </div>
      </div>
      <img src={Arrow} alt="Seta para a direita" className="h-15 w-15" />
    </button>
  );
}

export default EvaluationStatusButton;
