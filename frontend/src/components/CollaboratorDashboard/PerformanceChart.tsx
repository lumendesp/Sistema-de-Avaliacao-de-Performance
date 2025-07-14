import { useEffect, useState } from 'react';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../../context/AuthContext';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const PerformanceChart = () => {
  const { token, user } = useAuth();
  const [chartData, setChartData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://localhost:3000/ciclos', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ciclos = await response.json();

        const ciclosOrdenados = ciclos
          .filter((c: any) => c.status === 'PUBLISHED')
          .sort((a: any, b: any) => b.id - a.id); 

        const notas: number[] = [];
        const nomes: string[] = [];

        for (const ciclo of ciclosOrdenados) {
          try {
            const res = await fetch(
              `http://localhost:3000/final-scores/user/${user.id}/cycle/${ciclo.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.ok) {
              const notaData = await res.json();
              notas.push(notaData.finalScore);
              nomes.push(ciclo.name);
            }
          } catch (e) {
            console.warn(`Erro ao buscar nota para ciclo ${ciclo.name}`, e);
          }
        }

        setChartData(notas);
        setLabels(nomes);
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
      }
    };

    fetchChartData();
  }, [token, user]);

  const data = {
    labels,
    datasets: [
      {
        data: chartData,
        backgroundColor: chartData.map(n =>
          n >= 4.5 ? '#22C55E' : n >= 4 ? '#14B8A6' : '#FACC15'
        ),
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
      },
    },
  };

  return (
    <div className="w-full bg-white rounded-xl p-5 shadow flex flex-col gap-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-base font-semibold text-gray-800">Desempenho</h2>
      </div>

      <div className="h-64 sm:h-72 min-h-[250px]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default PerformanceChart;
