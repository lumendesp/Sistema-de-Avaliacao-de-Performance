// src/components/RH/RHBarChart/RHBarChart.tsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// É necessário registrar os componentes que o Chart.js usará
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Definimos o tipo de dado que nosso gráfico espera
interface RHBarChartProps {
  chartData: {
    labels: string[];
    datasets: any[]; // Usamos 'any' para simplificar, mas pode ser tipado
  };
}

const RHBarChart: React.FC<RHBarChartProps> = ({ chartData }) => {
  // Opções para customizar a aparência do gráfico, como no Figma
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Importante para o gráfico preencher o container
    plugins: {
      legend: {
        display: false, // Esconde a legenda (não tem no Figma)
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 25, // Define os intervalos do eixo Y como no Figma (0, 25, 50...)
        },
      },
      x: {
        grid: {
          display: false, // Remove as linhas de grade verticais
        },
      },
    },
  };

  return <Bar options={options} data={chartData} />;
};

export default RHBarChart;