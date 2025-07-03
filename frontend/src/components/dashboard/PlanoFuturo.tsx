import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { API_URL } from '../../services/api';

const PlanoFuturo: React.FC = () => {
  const [pending, setPending] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/ciclos/dashboard/manager`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Erro ao buscar métricas');
        const data = await res.json();
        setPending(Number(data.pendingCollaborators || 0));
      } catch {
        setPending(0);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

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
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <ClockIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ciclo de avaliação atual</p>
                <p className="text-sm text-gray-500">Termina em 15 dias</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanoFuturo; 