import React from 'react';
import ColaboradoresList from '../components/dashboard/ColaboradoresList';
import PlanoFuturo from '../components/dashboard/PlanoFuturo';
import Metricas from '../components/dashboard/Metricas';

const DashboardManagerPage: React.FC = () => (
  <div className="min-h-screen bg-gray-100 p-4 md:p-8 w-full">
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <Metricas />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          <ColaboradoresList />
        </div>
        <div className="col-span-1">
          <PlanoFuturo />
        </div>
      </div>
    </div>
  </div>
);
export default DashboardManagerPage; 