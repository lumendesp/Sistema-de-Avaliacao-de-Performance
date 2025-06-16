import React from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-1">{trend}</p>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-full">
        {icon}
      </div>
    </div>
  </div>
);

const GestorDashboard: React.FC = () => {

  const metrics = [
    {
      title: 'Total de Avaliações',
      value: '156',
      icon: <ChartBarIcon className="h-6 w-6 text-blue-600" />,
      trend: '+12% este mês'
    },
    {
      title: 'Colaboradores Avaliados',
      value: '45',
      icon: <UserGroupIcon className="h-6 w-6 text-blue-600" />,
      trend: '+5% este mês'
    },
    {
      title: 'Avaliações Pendentes',
      value: '8',
      icon: <ClockIcon className="h-6 w-6 text-blue-600" />,
    },
    {
      title: 'Média de Desempenho',
      value: '4.2/5',
      icon: <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />,
      trend: '+0.3 este mês'
    }
  ];

  const avaliacoesRecentes = [
    { nome: 'João Silva', departamento: 'Desenvolvimento', avaliacao: 4.5, data: '15/03/2024' },
    { nome: 'Maria Santos', departamento: 'Marketing', avaliacao: 4.2, data: '14/03/2024' },
    { nome: 'Pedro Oliveira', departamento: 'Vendas', avaliacao: 4.8, data: '13/03/2024' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard do Gestor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Avaliações Recentes */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Avaliações Recentes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colaborador</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avaliação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {avaliacoesRecentes.map((avaliacao, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{avaliacao.nome}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avaliacao.departamento}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avaliacao.avaliacao}/5</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{avaliacao.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Próximas Ações */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Próximas Ações</h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Revisar avaliações pendentes</p>
                <p className="text-sm text-gray-500">8 avaliações aguardando sua revisão</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <ClockIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ciclo de avaliação atual</p>
                <p className="text-sm text-gray-500">Termina em 15 dias</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestorDashboard; 