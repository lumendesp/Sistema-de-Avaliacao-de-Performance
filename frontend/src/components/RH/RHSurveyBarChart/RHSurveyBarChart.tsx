import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import type { ChartOptions } from "chart.js";

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
interface RHSurveyBarChartProps {
  chartData: {
    labels: string[];
    datasets: any[]; // Usamos 'any' para simplificar, mas pode ser tipado
  };
}

const RHSurveyBarChart: React.FC<RHSurveyBarChartProps> = ({ chartData }) => {
  // Opções para customizar a aparência do gráfico, como no Figma
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (value) => value.toString(),
        },
        grid: {
          color: "#e5e7eb", // linhas de grade claras
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return <Bar options={options} data={chartData} />;
};

export default RHSurveyBarChart;
