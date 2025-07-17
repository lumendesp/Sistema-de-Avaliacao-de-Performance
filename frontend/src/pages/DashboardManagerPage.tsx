import React, { useEffect, useState } from 'react';
import ColaboradoresList from '../components/dashboard/ColaboradoresList';
import PlanoFuturo from '../components/dashboard/PlanoFuturo';
import Metricas from '../components/dashboard/Metricas';
import EvaluationStatusButton from '../components/EvaluationStatusButton/EvaluationStatusButton';
import { fetchActiveEvaluationCycle, fetchMostRecentEvaluationCycle } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DashboardManagerPage: React.FC = () => {
  const { user } = useAuth();
  const [cycle, setCycle] = useState<any>(null);
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const ciclo = await fetchMostRecentEvaluationCycle();
        setCycle(ciclo);
        if (ciclo && ciclo.endDate) {
          const endDate = new Date(ciclo.endDate);
          const hoje = new Date();
          const diff = Math.ceil((endDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
          setDiasRestantes(diff > 0 ? diff : 0);
        }
      } catch {
        setCycle(null);
        setDiasRestantes(null);
      }
    };
    fetchCycle();
  }, []);

  // Função para mapear status do ciclo para status do botão
  const mapCycleStatusToUIStatus = (status: string): 'aberto' | 'emBreve' | 'disponivel' => {
    switch (status) {
      case 'IN_PROGRESS_COLLABORATOR':
        return 'aberto';
      case 'IN_PROGRESS_MANAGER':
      case 'IN_PROGRESS_COMMITTEE':
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
      <div className="flex flex-col gap-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Olá, <span className="font-normal">{user?.name || 'usuário'}</span>
        </h1>
        {cycle && diasRestantes !== null ? (
          <EvaluationStatusButton
            status={mapCycleStatusToUIStatus(cycle.status)}
            ciclo={cycle.name}
            diasRestantes={diasRestantes}
            context="manager"
            originalStatus={cycle.status}
          />
        ) : (
          <EvaluationStatusButton
            status="emBreve"
            ciclo=""
            diasRestantes={undefined}
            context="manager"
            originalStatus={undefined}
          />
        )}
        <Metricas />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="col-span-1">
            <ColaboradoresList />
          </div>
          <div className="col-span-1">
            <PlanoFuturo cicloStatus={cycle?.status} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardManagerPage; 