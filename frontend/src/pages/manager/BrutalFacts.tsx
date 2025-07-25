import React, { useEffect, useState } from 'react';
import Metricas from '../../components/BrutalFacts/Metricas';
import BrutalFactsSummary from '../../components/BrutalFacts/BrutalFactsSummary';
import BrutalFactsChart from '../../components/BrutalFacts/BrutalFactsChart';
import BrutalFactsEqualizationList from '../../components/BrutalFacts/BrutalFactsEqualizationList';
import { API_URL } from '../../services/api';

const BrutalFacts: React.FC = () => {
  const [hasClosedCycle, setHasClosedCycle] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/ciclos/brutal-facts`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Erro ao buscar ciclo');
        const data = await res.json();
        // Se houver cycleName, significa que há ciclo finalizado
        setHasClosedCycle(!!data.cycleName);
      } catch {
        setHasClosedCycle(false);
      } finally {
        setLoading(false);
      }
    };
    fetchCycle();
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f1f1] p-4 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Brutal Facts</h1>
        {loading || hasClosedCycle === null ? (
          <div className="w-full mb-4">
            <div className="bg-gray-100 border border-gray-200 text-gray-600 rounded-lg p-3 sm:p-4 text-center text-sm font-medium">
              Carregando informações do ciclo...
            </div>
          </div>
        ) : !hasClosedCycle ? (
          <div className="w-full mb-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 sm:p-4 text-center text-sm sm:text-base font-semibold">
              Os dados de Brutal Facts só aparecerão quando houver pelo menos um ciclo finalizado. Se o ciclo atual estiver em andamento, aguarde o término para visualizar os dados.
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <Metricas />
            <BrutalFactsSummary />
            <BrutalFactsChart />
            <BrutalFactsEqualizationList />
          </div>
        )}
      </div>
    </div>
  );
};

export default BrutalFacts; 