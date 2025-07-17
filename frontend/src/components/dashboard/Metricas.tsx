import React, { useEffect, useState } from "react";
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/api";

interface DashboardStats {
  totalEvaluations: string;
  evaluatedCollaborators: string;
  pendingCollaborators: string;
  averageScore: string;
  evaluationTrend: string;
  collaboratorTrend: string;
  scoreTrend: string;
  totalCollaborators: string;
}

const Metricas: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Novo: trigger para forçar reload das métricas
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Função local para forçar reload
  const reloadMetricas = () => setReloadTrigger((v) => v + 1);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        // Busca diferente para mentor
        let url = `${API_URL}/ciclos/dashboard/manager`;
        if (user && user.roles && user.roles.some((r: any) => r.role === 'MENTOR')) {
          url = `${API_URL}/ciclos/dashboard/mentor`;
        }
        const res = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error(`Erro ao buscar estatísticas: ${res.status}`);
        }
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error('Erro ao buscar métricas:', err);
        setError(err.message);
        // Fallback para dados mock caso a API falhe
        setStats({
          totalEvaluations: "156",
          evaluatedCollaborators: "45",
          pendingCollaborators: "8",
          averageScore: "4.2/5",
          evaluationTrend: "+12% este mês",
          collaboratorTrend: "+5% este mês",
          scoreTrend: "+0.3 este mês",
          totalCollaborators: "53"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, reloadTrigger]);

  const metrics = stats ? [
    {
      title: "Total de Avaliações",
      value: stats.totalEvaluations,
      icon: <ChartBarIcon className="h-6 w-6 text-blue-600" />,
      trend: stats.evaluationTrend,
    },
    {
      title: "Colaboradores Avaliados",
      value: stats.evaluatedCollaborators,
      icon: <UserGroupIcon className="h-6 w-6 text-blue-600" />,
      trend: stats.collaboratorTrend,
    },
    {
      title: "Avaliações Pendentes",
      value: stats.pendingCollaborators,
      icon: <ClockIcon className="h-6 w-6 text-blue-600" />,
    },
    {
      title: "Média de Desempenho",
      value: stats.averageScore,
      icon: <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />,
      trend: stats.scoreTrend,
    },
  ] : [];

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
  }> = ({ title, value, icon, trend }) => {
     // Exibe a tendência apenas se trend não for undefined
    const shouldShowTrend = trend !== undefined && trend !== null && trend !== '';
    const trendColor = trend && trend.trim().startsWith('-') ? 'text-red-600' : 'text-green-600';
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
            {shouldShowTrend && <p className={`text-sm mt-1 ${trendColor}`}>{trend}</p>}
          </div>
          <div className="p-3 bg-blue-50 rounded-full">{icon}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="p-3 bg-gray-200 rounded-full w-12 h-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Atenção:</strong> {error}. Exibindo dados de exemplo.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default Metricas;
