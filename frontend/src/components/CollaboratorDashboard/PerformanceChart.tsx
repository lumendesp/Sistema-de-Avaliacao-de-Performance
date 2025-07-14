import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { BarChartData, BarChartOptions } from '../../types/DashboardCollaboratorTypes/performanceChart';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const PerformanceChart = () => {
  const data: BarChartData = {
    labels: ['2023.1', '2023.2', '2024.1', '2024.2'],
    datasets: [
      {
        label: 'Nota',
        data: [3.5, 3.3, 4.2, 4.6],
        backgroundColor: ['#FACC15', '#FACC15', '#14B8A6', '#22C55E'],
        borderRadius: 6,
        barThickness: 40,
      },
    ],
  };

  const options: BarChartOptions = {
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
        <select className="hidden sm:block text-sm border border-gray-300 rounded-md px-3 py-1 text-gray-700">
          <option>Filtrar por</option>
        </select>
      </div>

      <div className="h-64 sm:h-72 min-h-[250px]">
        <Bar data={data} options={options} />
      </div>

    </div>
  );
};

export default PerformanceChart;
