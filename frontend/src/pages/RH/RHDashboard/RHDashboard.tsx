import RHMetricsCard from '../../../components/RH/RHMetricsCard/RHMetricsCard';
import RHCircularProgressCard from '../../../components/RH/RHCircularProgressCard/RHCircularProgressCard';
import CollaboratorRow from '../../../components/RH/CollaboratorRow/CollaboratorRow';
import RHBarChart from '../../../components/RH/RHBarChart/RHBarChart';
/* import CustomCalendarIcon from '../../../components/RH/icons/CalendarIcons'; */
import CustomDocumentIcon from '../../../components/RH/icons/DocumentIcon';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { getRHDashboardData } from '../../../services/api';
import { type RHDashboardData } from '../../../types/rh'
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';

function RHDashboard() {
    const { user } = useAuth();

    const [dashboardData, setDashboardData] = useState<RHDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [chartFilter, setChartFilter] = useState<'finalizado' | 'em_andamento' | 'pendente'>('finalizado');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getRHDashboardData();
                setDashboardData(data);
            } catch (err) {
                setError('Falha ao carregar os dados do dashboard.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const chartConfig = {
        finalizado: {
            label: 'Avaliações Finalizadas',
            data: dashboardData?.completionByTrack.map(t => t.completedCount) || [],
            backgroundColor: '#4ade80',
        },
        em_andamento: {
            label: 'Avaliações em Andamento',
            data: dashboardData?.completionByTrack.map(t => t.inProgressCount) || [],
            backgroundColor: '#FCD34D',
        },
        pendente: {
            label: 'Avaliações Pendentes',
            data: dashboardData?.completionByTrack.map(t => t.pendingCount) || [],
            backgroundColor: '#ef4444',
        },
    };

    const chartData = {
        labels: dashboardData?.completionByTrack.map(t => t.track) || [],
        datasets: [
            {
                label: chartConfig[chartFilter].label,
                data: chartConfig[chartFilter].data,
                backgroundColor: chartConfig[chartFilter].backgroundColor,
                borderRadius: 5,
                maxBarThickness: 50,
            },
        ],
    };

    if (isLoading) {
        return <div className="p-8 text-center">Carregando dados...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    // Se não está carregando e não tem erro, mas não há dados
    if (!dashboardData) {
        return <div className="p-8 text-center">Nenhum dado encontrado.</div>;
    }

    let calendarIconColor = 'text-green-600';
    let cardBgColor = 'bg-green-300';

    if (dashboardData.daysRemaining <= 7 && dashboardData.daysRemaining >= 3) {
        calendarIconColor = 'text-yellow-500';
        cardBgColor = 'bg-yellow-200';
    } else if (dashboardData.daysRemaining <= 2) {
        calendarIconColor = 'text-red-500';
        cardBgColor = 'bg-red-300';
    }

    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-lg text-gray-800">
                    <span className="font-semibold">Olá</span>, {user?.name || 'RH'}
                </h1>
            </header>

            {/* Seção dos Cards de Métricas */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RHCircularProgressCard
                    percentage={dashboardData.completionPercentage}
                    description={`${dashboardData.completedEvaluations} de ${dashboardData.totalEvaluations} colaboradores finalizaram`}
                />
                <RHMetricsCard
                    title="Avaliações pendentes"
                    description={`${dashboardData.pendingEvaluations} colaboradores ainda não fecharam`}
                    value={dashboardData.pendingEvaluations}
                    icon={CustomDocumentIcon}
                    iconBgColor="bg-white"
                    iconColor="text-red-600"
                />
                <RHMetricsCard
                    title="Fechamento de ciclo"
                    description={
                        dashboardData.daysRemaining > 0
                            ? `Faltam ${dashboardData.daysRemaining} dia(s) para o fechamento`
                            : 'O prazo para o ciclo encerrou.'
                    }
                    value={dashboardData.daysRemaining}
                    unit={dashboardData.daysRemaining === 1 ? 'dia' : 'dias'}
                    icon={CalendarDaysIcon}
                    iconBgColor="bg-white"
                    iconColor={calendarIconColor}
                    backgroundColor={cardBgColor}
                />
            </section>

            {/* Seção Inferior */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Colaboradores</h2>
                        <Link to="/rh/collaborators" className="px-4 py-2 text-sm font-medium text-[#08605F] hover:bg-[#08605F]/5 rounded-md">Ver mais</Link>
                    </div>
                    <div className="flex flex-col gap-y-1 max-h-[350px] overflow-y-auto pr-2">
                        {dashboardData.collaborators.map(c => <CollaboratorRow key={c.id} collaborator={c} />)}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Preenchimento por Trilha</h2>
                        <select
                            value={chartFilter}
                            onChange={(e) => setChartFilter(e.target.value as any)}
                            className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="finalizado">Finalizados</option>
                            <option value="em_andamento">Em andamento</option>
                            <option value="pendente">Pendentes</option>
                        </select>
                    </div>
                    <div className="h-[320px] relative">
                        <RHBarChart chartData={chartData} />
                    </div>
                </div>
            </section>
        </>
    );
}

export default RHDashboard;