import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import EvaluationComparisonGroupList from "../../../components/ComparisonEvaluationForm/EvaluationComparisonGroupList";
import { useAuth } from "../../../context/AuthContext";
import type { TrackWithGroups } from "../../../types/selfEvaluation";
import SelfEvaluationGroupReadOnlyList from "../../../components/SelfEvaluationForm/ReadOnly/SelfEvaluationGroupListReadOnly";
import axios from "axios";

type OutletContextType = {
  selectedCycleId: number | null;
  selectedCycleName: string;
};

interface Cycle {
  id: number;
  name: string;
  status:
    | "IN_PROGRESS_COLLABORATOR"
    | "IN_PROGRESS_MANAGER"
    | "IN_PROGRESS_COMMITTEE"
    | "CLOSED"
    | "PUBLISHED";
}

export default function ComparisonEvaluation() {
  const { token, user } = useAuth();
  const { selectedCycleId, selectedCycleName } = useOutletContext<OutletContextType>();
  const [trackData, setTrackData] = useState<TrackWithGroups | null>(null);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [hasMentorEvaluation, setHasMentorEvaluation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar trilha
        const resTrack = await fetch("http://localhost:3000/rh-criteria/tracks/with-criteria", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tracks: TrackWithGroups[] = await resTrack.json();
        const userTrack = tracks.find((t) => t.id === user?.trackId);
        if (userTrack) setTrackData(userTrack);

        // Buscar ciclos
        const resAll = await fetch("http://localhost:3000/ciclos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCycles: Cycle[] = await resAll.json();

        // Selecionar ciclo por nome ou ID
        let selected: Cycle | undefined;
        if (selectedCycleName) {
          selected = allCycles.find((c) => c.name === selectedCycleName);
        } else if (selectedCycleId) {
          const cleanCycleId = typeof selectedCycleId === "string"
            ? parseInt(selectedCycleId.split(":")[0], 10)
            : Number(selectedCycleId);
          selected = allCycles.find((c) => c.id === cleanCycleId);
        }

        if (selected) {
          setCycle(selected);

          // Verifica se há avaliação de gestor
          try {
            const managerRes = await axios.get(
              `http://localhost:3000/manager-evaluation/${user?.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const evaluations = managerRes.data;
            const hasForSelectedCycle = evaluations.some(
              (ev: any) => ev.cycleId === selected?.id
            );
            setHasMentorEvaluation(hasForSelectedCycle);
          } catch (error) {
            console.warn("Erro ao buscar avaliação do gestor:", error);
          }
        }
      } catch (err) {
        console.warn("Erro ao buscar dados iniciais:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.trackId, user?.id, selectedCycleId, selectedCycleName]);

  if (loading) {
    return <div className="bg-[#f1f1f1] h-screen w-full" />;
  }

  if (!trackData) {
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">
          Erro ao carregar sua trilha. Por favor, tente novamente.
        </p>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-start">
          Selecione um ciclo para visualizar sua autoavaliação anterior.
        </p>
      </div>
    );
  }

  if (cycle.status === "PUBLISHED" && hasMentorEvaluation) {
    return <EvaluationComparisonGroupList cycleId={cycle.id} trackData={trackData} />;
  } else {
    return (
      <div className="p-3 bg-[#f1f1f1] space-y-6">
        <SelfEvaluationGroupReadOnlyList cycleId={cycle.id} trackData={trackData} />
      </div>
    );
  }
}
