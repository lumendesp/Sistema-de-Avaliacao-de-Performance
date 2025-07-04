import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DashboardHeader from '../../components/CollaboratorDashboard/DashboardHeader';
import EvaluationStatusButton from '../../components/EvaluationStatusButton/EvaluationStatusButton';
import EvaluationCardList from '../../components/CollaboratorDashboard/EvaluationCardList';
import PerformanceChart from '../../components/CollaboratorDashboard/PerformanceChart';

interface Cycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'IN_PROGRESS' | 'CLOSED' | 'PUBLISHED';
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const response = await axios.get<Cycle>('http://localhost:3000/evaluation-cycle/recent', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cicloMaisRecente = response.data;
        setCycle(cicloMaisRecente);

        const endDate = new Date(cicloMaisRecente.endDate);
        const hoje = new Date();
        const diff = Math.ceil((endDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        setDiasRestantes(diff > 0 ? diff : 0);
      } catch (error) {
        console.error('Erro ao buscar ciclo mais recente:', error);
      }
    };

    fetchCycle();
  }, [token]);

  const mapCycleStatusToUIStatus = (status: string): 'aberto' | 'emBreve' | 'disponivel' => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'aberto';
      case 'CLOSED':
        return 'emBreve';
      case 'PUBLISHED':
        return 'disponivel';
      default:
        return 'emBreve';
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 p-10 bg-[#f1f1f1]">
      <DashboardHeader name={user?.name ?? 'Usuário'} />
      {cycle && diasRestantes !== null && (
        <EvaluationStatusButton
          status={mapCycleStatusToUIStatus(cycle.status)}
          ciclo={cycle.name}
          diasRestantes={diasRestantes}
        />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EvaluationCardList />
        <PerformanceChart />
      </div>
    </div>
  );
}
