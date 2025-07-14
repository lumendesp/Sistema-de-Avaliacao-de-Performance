import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import EvaluationComparisonGroupList from "../../../components/ComparisonEvaluationForm/EvaluationComparisonGroupList";
import { useAuth } from "../../../context/AuthContext";
import type { TrackWithGroups } from "../../../types/selfEvaluation";
import SelfEvaluationGroupReadOnlyList from "../../../components/SelfEvaluationForm/ReadOnly/SelfEvaluationGroupListReadOnly";

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
  const { selectedCycleId } = useOutletContext<OutletContextType>();
  const [trackData, setTrackData] = useState<TrackWithGroups | null>(null);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTrack = await fetch("http://localhost:3000/rh-criteria/tracks/with-criteria", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tracks: TrackWithGroups[] = await resTrack.json();
        const userTrack = tracks.find((t) => t.id === user?.trackId);
        if (userTrack) setTrackData(userTrack);

        if (selectedCycleId) {
          const cleanCycleId = parseInt(
            typeof selectedCycleId === "string"
              ? selectedCycleId.split(":")[0]
              : String(selectedCycleId),
            10
          );

          const resAll = await fetch("http://localhost:3000/ciclos", {
            headers: { Authorization: `Bearer ${token}` },
          });

          const allCycles: Cycle[] = await resAll.json();
          const selected = allCycles.find((c) => c.id === cleanCycleId);
          if (selected) setCycle(selected);
        }
      } catch (err) {
        // Silencia erros em produção
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user?.trackId, selectedCycleId]);

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

  if (!selectedCycleId || !cycle) {
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-start">
          Selecione um ciclo para visualizar sua autoavaliação anterior.
        </p>
      </div>
    );
  }

  if (cycle.status === "PUBLISHED") {
    return <EvaluationComparisonGroupList cycleId={cycle.id} trackData={trackData} />;
  } else {
    return (
      <div className="p-3 bg-[#f1f1f1] space-y-6">
        <SelfEvaluationGroupReadOnlyList cycleId={cycle.id} trackData={trackData} />
      </div>
    );
  }
}
