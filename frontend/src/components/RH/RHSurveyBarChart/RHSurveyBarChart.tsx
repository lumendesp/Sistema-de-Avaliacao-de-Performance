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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RHSurveyBarChartProps {
  chartData: {
    labels: string[];
    datasets: any[];
    tooltips?: string[];
  };
}

const RHSurveyBarChart: React.FC<RHSurveyBarChartProps> = ({ chartData }) => {
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: function (context) {
            const score = context.parsed.y;
            return [
              `Nota IA: ${score}`,
            ].filter(Boolean);
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Nota de Satisfação IA",
        },
        ticks: {
          stepSize: 20,
          callback: (value) => value.toString(),
        },
        grid: {
          color: "#e5e7eb",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <>
      <Bar options={options} data={chartData} />
    </>
  );
};

export default RHSurveyBarChart;
