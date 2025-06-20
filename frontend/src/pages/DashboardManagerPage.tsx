import React from 'react';
import ColaboradoresList from '../components/dashboard/ColaboradoresList';
import PlanoFuturo from '../components/dashboard/PlanoFuturo';
import Metricas from '../components/dashboard/Metricas';

const DashboardManagerPage: React.FC = () => (

    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center gap-8">
        <Metricas />
        <ColaboradoresList />
        <PlanoFuturo />
    </div>
);
export default DashboardManagerPage; 