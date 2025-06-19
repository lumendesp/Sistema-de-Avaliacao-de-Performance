import DashboardHeader from '../../components/CollaboratorDashboard/DashboardHeader';
import EvaluationStatusButton from '../../components/EvaluationStatusButton/EvaluationStatusButton';
import EvaluationCardList from '../../components/CollaboratorDashboard/EvaluationCardList';
import PerformanceChart from '../../components/CollaboratorDashboard/PerformanceChart';

export default function Dashboard() {
  return (
    <div className="w-full flex flex-col gap-4 p-10 bg-[#f1f1f1]">
      <DashboardHeader name="João Silva" />
      <EvaluationStatusButton status="aberto" ciclo="2025.1" diasRestantes={15} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EvaluationCardList />
        <PerformanceChart />
      </div>
    </div>
  );
}
