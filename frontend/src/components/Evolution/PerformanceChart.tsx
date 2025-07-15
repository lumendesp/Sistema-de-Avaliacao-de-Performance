import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

interface PerformanceItem {
  cycle: string;
  score: number;
}

interface PerformanceChartProps {
  performance: PerformanceItem[];
}

const getEvaluationColor = (score: number): string => {
  if (score >= 4.5) return "#065F46"; // verde escuro
  if (score >= 4.0) return "#0F766E"; // teal escuro
  if (score >= 3.0) return "#CA8A04"; // amarelo escuro
  if (score > 0) return "#DC2626"; // vermelho
  return "#E5E7EB"; // cinza claro para vazios
};

const PerformanceChart: React.FC<PerformanceChartProps> = ({ performance }) => {
  const MAX_BARS = 5;

  const realBars = performance.slice().sort((a, b) => {
    const aNum = Number(a.cycle);
    const bNum = Number(b.cycle);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return a.cycle.localeCompare(b.cycle, "pt-BR", { numeric: true });
  });

  const emptyBars = Array(MAX_BARS - realBars.length).fill({
    cycle: "",
    score: 0,
  });
  const sortedBars = [...realBars, ...emptyBars];

  const chartData = {
    labels: sortedBars.map((item) => item.cycle),
    datasets: [
      {
        label: "Nota",
        data: sortedBars.map((item) => item.score),
        backgroundColor: sortedBars.map((item) =>
          getEvaluationColor(item.score)
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
          color: "#6B7280",
        },
        grid: {
          color: "#E5E7EB",
        },
      },
      x: {
        ticks: {
          font: { size: 12 },
          color: "#6B7280",
        },
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111827",
        titleColor: "#fff",
        bodyColor: "#fff",
        cornerRadius: 4,
        padding: 8,
        callbacks: {
          label: function (context: any) {
            return `Nota: ${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-8 w-full overflow-x-hidden">
      <span className="text-gray-700 font-semibold">Desempenho</span>
      <div className="h-40 mt-4 w-full overflow-x-hidden">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PerformanceChart;
