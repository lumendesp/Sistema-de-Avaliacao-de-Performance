import React from 'react';

interface PerformanceItem {
  cycle: string;
  score: number;
}

interface PerformanceChartProps {
  performance: PerformanceItem[];
}

const MAX_BARS = 5;
const BAR_COLORS = [
  'bg-green-400',
  'bg-blue-400',
  'bg-yellow-400',
  'bg-purple-400',
  'bg-pink-400',
];

const PerformanceChart: React.FC<PerformanceChartProps> = ({ performance }) => {
  // Preenche com barras "vazias" se houver menos de 5 ciclos
  const bars = performance.length < MAX_BARS
    ? [
        ...performance,
        ...Array(MAX_BARS - performance.length).fill({ cycle: '', score: 0 })
      ]
    : performance;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-8">
      <span className="text-gray-700 font-semibold">Desempenho</span>
      <div className="flex items-end h-40 mt-4 justify-center gap-8">
        {bars.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center w-12">
            <div
              className={`w-8 rounded-t ${item.score > 0 ? BAR_COLORS[idx % BAR_COLORS.length] : 'bg-gray-100'}`}
              style={{ height: `${item.score * 30}px` }}
              title={item.score > 0 ? `Nota: ${item.score}` : ''}
            ></div>
            <span className="text-xs mt-2 text-gray-600">
              {item.cycle}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceChart; 