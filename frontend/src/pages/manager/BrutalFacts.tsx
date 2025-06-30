import React from 'react';
import Metricas from '../../components/BrutalFacts/Metricas';
import BrutalFactsSummary from '../../components/BrutalFacts/BrutalFactsSummary';
import BrutalFactsChart from '../../components/BrutalFacts/BrutalFactsChart';
import BrutalFactsEqualizationList from '../../components/BrutalFacts/BrutalFactsEqualizationList';

const BrutalFacts: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center gap-8">
      <h1 className="text-3xl font-bold mb-4">Brutal Facts</h1>
      <Metricas />
      <BrutalFactsSummary />
      <BrutalFactsChart />
      <BrutalFactsEqualizationList />
    </div>
  );
};

export default BrutalFacts; 