import RHMetricsCard from '../../../components/RH/RHMetricsCard/RHMetricsCard';
import RHCircularProgressCard from '../../../components/RH/RHCircularProgressCard/RHCircularProgressCard';
import CollaboratorRow from '../../../components/RH/CollaboratorRow/CollaboratorRow';
import RHBarChart from '../../../components/RH/RHBarChart/RHBarChart';
import { mockCollaborators } from '../../../data/rh_data';
import CustomCalendarIcon from '../../../components/RH/icons/CalendarIcons';
import CustomDocumentIcon from '../../../components/RH/icons/DocumentIcon';

function RHDashboard() {
    // Lógica para calcular os totais
    const total = mockCollaborators.length;
    const completed = mockCollaborators.filter(c => c.status === 'finalizado').length;
    const pending = total - completed;
    const completionPercentage = Math.round((completed / total) * 100);

    const processChartData = () => {
        // Encontra todos os setores únicos nos dados
        const units = [...new Set(mockCollaborators.map(c => c.unit))];
        // Conta quantos finalizaram em cada setor
        const completedData = units.map(unit =>
            mockCollaborators.filter(c => c.unit === unit && c.status === 'finalizado').length
        );

        return {
            labels: units,
            datasets: [
                {
                    label: 'Avaliações Concluídas',
                    data: completedData,
                    backgroundColor: [
                        '#043c3c',
                        '#ffc857',
                        '#345c64',
                        '#3c7c7c',
                    ],
                    borderRadius: 5,
                    maxBarThickness: 50,
                },
            ],
        };
    };

    const chartData = processChartData();

    return (
        <>
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Olá, RH</h1>
                <div className="w-12 h-12 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center font-bold text-lg">
                    CN
                </div>
            </header>

            {/* Seção dos Cards de Métricas */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RHCircularProgressCard
                    percentage={completionPercentage}
                    description={`${completed} de ${total} colaboradores finalizaram`}
                />
                <RHMetricsCard
                    title="Avaliações pendentes"
                    description={`${pending} colaboradores ainda não fecharam`}
                    value={pending}
                    icon={CustomDocumentIcon}
                    iconBgColor="bg-white"
                    iconColor="text-red-600"
                />
                <RHMetricsCard
                    title="Fechamento de ciclo"
                    description="Faltam 30 dias para o fechamento"
                    value={30}
                    unit="dias"
                    icon={CustomCalendarIcon}
                    iconBgColor="bg-white"
                    iconColor="text-green-600"
                />
            </section>

            {/* Seção Inferior */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Colaboradores</h2>
                        <a href="#" className="text-blue-500 hover:underline font-medium text-sm">Ver mais</a>
                    </div>
                    <div className="flex flex-col gap-y-1 max-h-[350px] overflow-y-auto pr-2">
                        {mockCollaborators.map(c => <CollaboratorRow key={c.id} collaborator={c} />)}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Preenchimento</h2>
                        <select className="border border-gray-300 rounded-lg py-1.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Todos os setores</option>
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