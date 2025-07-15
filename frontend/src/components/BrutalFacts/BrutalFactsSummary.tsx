import React, { useEffect, useState } from 'react';
import { API_URL } from '../../services/api';

interface BrutalFactsSummaryData {
  insights: string;
  averageAuto?: string;
  averageManager?: string;
  averagePeer?: string;
  averageFinal?: string;
  cycleName?: string;
  totalEvaluated?: string;
}

const BrutalFactsSummary: React.FC = () => {
  const [data, setData] = useState<BrutalFactsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

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
        const respData = await res.json();
        setData(respData);
      } catch (err: any) {
        setData({ insights: 'Erro ao carregar insights. Tente novamente.' });
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center mb-2">
          <span className="font-semibold text-gray-700">Resumo</span>
        </div>
        <div className="text-gray-600 text-sm">Carregando insights...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center mb-2">
        <span className="font-semibold text-gray-700">Resumo do ciclo {data?.cycleName || ''}</span>
      </div>
      <div className="text-gray-600 text-sm mb-2">
        <strong>Insight da IA:</strong> {data?.insights}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-500">
        <div><strong>Média Autoavaliação:</strong> {data?.averageAuto || '-'}</div>
        <div><strong>Média Gestor:</strong> {data?.averageManager || '-'}</div>
        <div><strong>Média 360:</strong> {data?.averagePeer || '-'}</div>
        <div><strong>Média Final:</strong> {data?.averageFinal || '-'}</div>
        <div><strong>Total avaliados:</strong> {data?.totalEvaluated || '-'}</div>
      </div>
    </div>
  );
};

export default BrutalFactsSummary; 