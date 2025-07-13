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

const PlanoFuturo: React.FC = () => {
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

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas Ações</h2>
          <div className="space-y-4">
            {pending > 0 && (
              <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Revisar avaliações pendentes</p>
                  <p className="text-sm text-gray-500">{pending} avaliação{pending > 1 ? 's' : ''} aguardando sua revisão</p>
                </div>
              </div>
            )}
            {currentCycle && (
              <div className={`flex items-center p-4 rounded-lg ${getCycleColor(currentCycle.daysRemaining).bg} ${getCycleColor(currentCycle.daysRemaining).border} border`}>
                <ClockIcon className={`h-5 w-5 mr-3 ${getCycleColor(currentCycle.daysRemaining).text}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ciclo de avaliação atual: {currentCycle.name}</p>
                  <p className={`text-sm ${getCycleColor(currentCycle.daysRemaining).text} font-medium`}>
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