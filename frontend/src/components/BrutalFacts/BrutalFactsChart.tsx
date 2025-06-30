import React, { useEffect, useState } from 'react';
import { API_URL } from '../../services/api';

interface ChartData {
  ciclo: string;
  valor: number;
}

const BrutalFactsChart: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/ciclos/brutal-facts`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Erro ao buscar dados do gráfico');
        const responseData = await res.json();
        setData(responseData.chartData || []);
      } catch (err: any) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
        <span className="font-semibold text-gray-700">Desempenho</span>
        <div className="mt-4 h-40 flex items-center justify-center">
          <span className="text-gray-500">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
        <span className="font-semibold text-gray-700">Desempenho</span>
        <div className="mt-4 h-40 flex items-center justify-center">
          <span className="text-gray-500">Nenhum dado disponível</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
      <span className="font-semibold text-gray-700">Desempenho</span>
      <div className="mt-4">
        <div className="flex items-end h-40 space-x-6">
          {data.map((item, idx) => (
            <div key={item.ciclo} className="flex flex-col items-center">
              <div
                className="bg-green-400 rounded-t w-10"
                style={{ height: `${Math.max(item.valor * 20, 10)}px` }}
              ></div>
              <span className="mt-2 text-xs text-gray-500">{item.ciclo}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrutalFactsChart; 