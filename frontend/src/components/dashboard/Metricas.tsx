import React from "react";
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

const Metricas: React.FC = () => {
  const metrics = [
    {
      title: "Total de Avaliações",
      value: "156",
      icon: <ChartBarIcon className="h-6 w-6 text-blue-600" />,
      trend: "+12% este mês",
    },
    {
      title: "Colaboradores Avaliados",
      value: "45",
      icon: <UserGroupIcon className="h-6 w-6 text-blue-600" />,
      trend: "+5% este mês",
    },
    {
      title: "Avaliações Pendentes",
      value: "8",
      icon: <ClockIcon className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Média de Desempenho",
      value: "4.2/5",
      icon: <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />,
      trend: "+0.3 este mês",
    },
  ];

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
  }> = ({ title, value, icon, trend }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
          {trend && <p className="text-sm text-green-600 mt-1">{trend}</p>}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto mb-8">
      <h1 className="text-2xl mb-6">
        <span className="font-bold">Olá,</span> Gestor
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default Metricas;
