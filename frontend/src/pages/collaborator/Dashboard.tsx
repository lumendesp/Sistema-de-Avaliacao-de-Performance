import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import DashboardHeader from "../../components/CollaboratorDashboard/DashboardHeader";
import EvaluationStatusButton from "../../components/EvaluationStatusButton/EvaluationStatusButton";
import EvaluationCardList from "../../components/CollaboratorDashboard/EvaluationCardList";
import PerformanceChart from "../../components/CollaboratorDashboard/PerformanceChart";

interface Cycle {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "IN_PROGRESS" | "CLOSED" | "PUBLISHED";
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        // Na página de colaborador, sempre buscar ciclo do tipo COLLABORATOR
        const mainRole = "COLLABORATOR";
        console.log("User roles:", user?.roles);
        console.log("Página de colaborador - buscando ciclo do tipo:", mainRole);

        const response = await axios.get<Cycle>(
          `http://localhost:3000/ciclos/current?status=IN_PROGRESS_COLLABORATOR`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const cicloMaisRecente = response.data;
        console.log("Ciclo recebido do backend:", cicloMaisRecente);
        setCycle(cicloMaisRecente);

        if (cicloMaisRecente && cicloMaisRecente.endDate) {
          const endDate = new Date(cicloMaisRecente.endDate);
          const hoje = new Date();
          const diff = Math.ceil(
            (endDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
          );
          setDiasRestantes(diff > 0 ? diff : 0);
        }
      } catch (error) {
        console.error("Erro ao buscar ciclo mais recente:", error);
      }
    };

    fetchCycle();
  }, [token, user]);

  const mapCycleStatusToUIStatus = (
    status: string
  ): "aberto" | "emBreve" | "disponivel" => {
    console.log("Mapeando status:", status);
    const mappedStatus = (() => {
      switch (status) {
        case "IN_PROGRESS_COLLABORATOR":
          return "aberto";
        case "CLOSED":
          return "emBreve";
        case "PUBLISHED":
          return "disponivel";
        default:
          return "emBreve";
      }
    })();
    console.log("Status mapeado para:", mappedStatus);
    return mappedStatus;
  };

  return (
    <div className="w-full flex flex-col gap-4 p-10 bg-[#f1f1f1]">
      <DashboardHeader name={user?.name ?? "Usuário"} />
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
