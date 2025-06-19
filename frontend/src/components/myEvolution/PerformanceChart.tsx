import React from 'react';

interface PerformanceItem {
  cycle: string;
  score: number;
}

interface PerformanceChartProps {
  performance: PerformanceItem[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ performance }) => (
  <div className="bg-white rounded-lg shadow p-4 mb-8">
    <span className="text-gray-700 font-semibold">Desempenho</span>
    <div className="flex items-end h-40 mt-4 gap-6">
      {performance.map((item) => (
        <div key={item.cycle} className="flex flex-col items-center">
          <div
            className="w-8 bg-green-400 rounded-t"
            style={{ height: `${item.score * 30}px` }}
            title={`Nota: ${item.score}`}
          ></div>
          <span className="text-xs mt-2">{item.cycle}</span>
        </div>
      ))}
    </div>
  </div>
);

export default PerformanceChart; 