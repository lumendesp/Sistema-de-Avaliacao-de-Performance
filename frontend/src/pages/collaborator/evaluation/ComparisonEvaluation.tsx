import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import EvaluationComparisonGroupList from "../../../components/ComparisonEvaluationForm/EvaluationComparisonGroupList";
import { useAuth } from "../../../context/AuthContext";
import type { TrackWithGroups } from "../../../types/selfEvaluation";

type OutletContextType = {
  selectedCycleId: number | null;
  selectedCycleName: string;
};

export default function ComparisonEvaluation() {
  const { token, user } = useAuth();
  const { selectedCycleId } = useOutletContext<OutletContextType>();
  const [trackData, setTrackData] = useState<TrackWithGroups | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const res = await fetch("http://localhost:3000/rh-criteria/tracks/with-criteria", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: TrackWithGroups[] = await res.json();
        const track = data.find((t) => t.id === user?.trackId);
        if (track) setTrackData(track);
      } catch (err) {
        console.error("Erro ao buscar dados da trilha:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrack();
  }, [token, user?.trackId]);

  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full" />;

  if (!trackData)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">
          Erro ao carregar sua trilha. Por favor, tente novamente.
        </p>
      </div>
    );

  if (!selectedCycleId)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-start">
          Selecione um ciclo para visualizar sua autoavaliação anterior.
        </p>
      </div>
    );

  return (
    <EvaluationComparisonGroupList
      cycleId={selectedCycleId}
      trackData={trackData}
    />
  );
}
