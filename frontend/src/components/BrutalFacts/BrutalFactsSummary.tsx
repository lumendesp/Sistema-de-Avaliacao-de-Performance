import React, { useEffect, useState } from 'react';
import { API_URL } from '../../services/api';

const BrutalFactsSummary: React.FC = () => {
  const [insights, setInsights] = useState<string>('Carregando insights...');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/ciclos/brutal-facts`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Erro ao buscar insights');
        const data = await res.json();
        setInsights(data.insights || 'Nenhum insight disponível.');
      } catch (err: any) {
        setInsights('Erro ao carregar insights. Tente novamente.');
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center mb-2">
        <span className="font-semibold text-gray-700">Resumo</span>
      </div>
      <div className="text-gray-600 text-sm">
        {insights}
      </div>
    </div>
  );
};

export default BrutalFactsSummary; 