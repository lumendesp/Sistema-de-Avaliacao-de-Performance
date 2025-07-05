import React, { useEffect, useState } from 'react';
import { API_URL } from '../../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

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

  // Ordena os ciclos em ordem crescente
  const sortedData = [...data].sort((a, b) => {
    const aNum = Number(a.ciclo);
    const bNum = Number(b.ciclo);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
    return a.ciclo.localeCompare(b.ciclo, 'pt-BR', { numeric: true });
  });

  // Cores para as barras, pode customizar conforme a quantidade de ciclos
  const barColors = ['#FACC15', '#FACC15', '#14B8A6', '#22C55E', '#6366F1', '#F472B6'];

  const chartData = {
    labels: sortedData.map((item) => item.ciclo),
    datasets: [
      {
        label: 'Nota média final',
        data: sortedData.map((item) => item.valor),
        backgroundColor: sortedData.map((_, idx) => barColors[idx % barColors.length]),
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        ticks: {
          stepSize: 1,
          font: { size: 12 },
          color: '#6B7280',
        },
        grid: {
          color: '#E5E7EB',
        },
      },
      x: {
        ticks: {
          font: { size: 12 },
          color: '#6B7280',
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#111827',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 4,
        padding: 8,
        callbacks: {
          label: function(context: any) {
            return `Média geral: ${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full max-w-5xl bg-white rounded-lg shadow p-6 mb-6">
      <span className="font-semibold text-gray-700">Desempenho</span>
      <div className="mt-4 h-64">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BrutalFactsChart; 