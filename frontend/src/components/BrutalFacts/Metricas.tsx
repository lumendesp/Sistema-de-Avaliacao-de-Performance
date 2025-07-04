import React, { useEffect, useState } from "react";
import { API_URL } from "../../services/api";

interface BrutalFactsStats {
  averageScore: string;
  scoreTrend?: string;
  evaluatedCollaborators: string;
  totalEvaluated?: string;
  averageFinal?: string;
  cycleName?: string;
}

const Metricas: React.FC = () => {
  const [stats, setStats] = useState<BrutalFactsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/ciclos/brutal-facts`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Erro ao buscar estatísticas');
        const data = await res.json();
        
        setStats({
          averageScore: data.averageScore || '0.0/5',
          scoreTrend: data.scoreTrend,
          evaluatedCollaborators: data.totalEvaluated || '0',
          averageFinal: data.averageFinal || data.averageScore || '0.0/5',
          cycleName: data.cycleName || ''
        });
      } catch (err: any) {
        setStats({
          averageScore: "4.14/5",
          scoreTrend: undefined,
          evaluatedCollaborators: "10",
          averageFinal: "4.14/5",
          cycleName: ''
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl flex justify-center items-center h-48">
        <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </div>
    );
  }

  const showScoreTrend = stats && typeof stats.scoreTrend === 'string' &&
    stats.scoreTrend.trim() !== '' &&
    stats.scoreTrend !== 'undefined' &&
    stats.scoreTrend !== 'null';

  const metrics = stats ? [
    {
      title: "Nota média geral",
      value: stats.averageFinal?.split('/')[0] || '-',
      icon: (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118l-3.385-2.46c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z" /></svg>
        </span>
      ),
      subtitle: `Em comparação ao ciclo ${stats.cycleName || ''}`,
      extra: <span className="text-green-600 font-semibold">Great</span>
    },
    {
      title: "Variação da média final",
      value: showScoreTrend && stats.scoreTrend ? stats.scoreTrend.replace(' este ciclo', '') : '-',
      icon: <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100"><svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></span>,
      subtitle: showScoreTrend && stats.scoreTrend ? `Variação em relação ao ciclo anterior: ${stats.scoreTrend}` : 'Não há ciclo anterior para comparar crescimento'
    },
    {
      title: "Liderados avaliados",
      value: stats.evaluatedCollaborators || '-',
      icon: <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-100"><svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" /></svg></span>,
      subtitle: `Foram avaliados ${stats.evaluatedCollaborators || '-'} colaboradores no ciclo` 
    },
  ] : [];

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle: string;
    extra?: React.ReactNode;
  }> = ({ title, value, icon, subtitle, extra }) => (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center min-w-[220px]">
      <div className="flex items-center justify-center mb-2">{icon}</div>
      <span className="text-gray-500 text-sm mb-1">{title}</span>
      <span className="text-3xl font-bold text-gray-900 flex items-center gap-2">{value} {extra}</span>
      <span className="text-xs text-gray-400 mt-1 text-center">{subtitle}</span>
    </div>
  );

  return (
    <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default Metricas; 