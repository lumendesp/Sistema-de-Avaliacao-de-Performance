import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { API_URL, fetchActiveEvaluationCycle } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CurrentCycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  daysRemaining: number;
  isOverdue: boolean;
}

interface PlanoFuturoProps {
  cicloStatus?: string;
}

const PlanoFuturo: React.FC<PlanoFuturoProps> = ({ cicloStatus }) => {
  const { user } = useAuth();
  const [pending, setPending] = useState<number>(0);
  const [currentCycle, setCurrentCycle] = useState<CurrentCycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        // Buscar dados do dashboard (pending)
        const dashboardRes = await fetch(`${API_URL}/ciclos/dashboard/manager`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (dashboardRes.ok) {
          const dashboardData = await dashboardRes.json();
          setPending(Number(dashboardData.pendingCollaborators || 0));
        }

        // Descobrir o role principal do usuário (primeiro role)
        const data = await fetchActiveEvaluationCycle('MANAGER');
        console.log('Cycle data received:', data);
        if (data && data.endDate) {
          const endDate = new Date(data.endDate);
          const today = new Date();
          const diffTime = endDate.getTime() - today.getTime();
          const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isOverdue = daysRemaining < 0;
          setCurrentCycle({
            ...data,
            daysRemaining,
            isOverdue,
          });
        } else {
          setCurrentCycle(data);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Função para determinar a cor baseada no prazo
  const getCycleColor = (daysRemaining: number) => {
    if (daysRemaining > 30) {
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200'
      };
    } else if (daysRemaining > 7) {
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-600',
        border: 'border-yellow-200'
      };
    } else {
      return {
        bg: 'bg-red-50',
        text: 'text-red-600',
        border: 'border-red-200'
      };
    }
  };

  // Função para determinar o texto do prazo
  const getDeadlineText = (daysRemaining: number, isOverdue: boolean) => {
    if (isOverdue) {
      return `Atrasado há ${Math.abs(daysRemaining)} dia${Math.abs(daysRemaining) > 1 ? 's' : ''}`;
    } else if (daysRemaining === 0) {
      return 'Termina hoje';
    } else if (daysRemaining === 1) {
      return 'Termina amanhã';
    } else {
      return `Termina em ${daysRemaining} dias`;
    }
  };

  if (loading) return null;

  // Não renderiza nada se não houver nenhuma ação a mostrar
  const showAutoAvaliacao = user?.roles?.includes('COLLABORATOR') && cicloStatus === 'IN_PROGRESS_COLLABORATOR';
  const showPending = pending > 0;
  const showCurrentCycle = !!currentCycle;
  if (!showAutoAvaliacao && !showPending && !showCurrentCycle) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-2 md:px-4">
      <div className="bg-white rounded-lg shadow">
        <div className="p-2 sm:p-4 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">Próximas Ações</h2>
          <div className="space-y-2 sm:space-y-4">
            {/* Aviso para colaborador preencher a parte de colaborador */}
            {showAutoAvaliacao && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center p-2 sm:p-4 bg-yellow-50 rounded-lg min-w-0 border border-yellow-200">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mr-0 sm:mr-3 mb-2 sm:mb-0 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-yellow-900 truncate">Preencha sua autoavaliação!</p>
                  <p className="text-xs sm:text-sm text-yellow-600 truncate">Acesse a etapa de colaborador para iniciar sua avaliação.</p>
                </div>
              </div>
            )}
            {showPending && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center p-2 sm:p-4 bg-yellow-50 rounded-lg min-w-0">
                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mr-0 sm:mr-3 mb-2 sm:mb-0 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Revisar avaliações pendentes</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{pending} avaliação{pending > 1 ? 's' : ''} aguardando sua revisão</p>
                </div>
              </div>
            )}
            {showCurrentCycle && (
              <div className={`flex flex-col sm:flex-row items-start sm:items-center p-2 sm:p-4 rounded-lg min-w-0 ${getCycleColor(currentCycle.daysRemaining).bg} ${getCycleColor(currentCycle.daysRemaining).border} border`}>
                <ClockIcon className={`h-4 w-4 sm:h-5 sm:w-5 mr-0 sm:mr-3 mb-2 sm:mb-0 ${getCycleColor(currentCycle.daysRemaining).text} flex-shrink-0`} />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Ciclo de avaliação atual: {currentCycle.name}</p>
                  <p className={`text-xs sm:text-sm ${getCycleColor(currentCycle.daysRemaining).text} font-medium truncate`}>
                    {getDeadlineText(currentCycle.daysRemaining, currentCycle.isOverdue)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanoFuturo; 