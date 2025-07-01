import { useEffect, useState } from "react";
import EvaluationComparisonGroupList from "../../../components/ComparisonEvaluationForm/EvaluationComparisonGroupList";
import type { TrackWithGroups } from "../../../types/selfEvaluation";
import { useAuth } from "../../../context/AuthContext";

export default function ComparisonEvaluation() {
  const { token, user } = useAuth();
  const [trackData, setTrackData] = useState<TrackWithGroups | null>(null);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await fetch("http://localhost:3000/rh-criteria/tracks/with-criteria", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: TrackWithGroups[] = await response.json();

        // Encontra a trilha do usuário
        const track = data.find((t) => t.id === user?.trackId);
        if (track) setTrackData(track);
      } catch (err) {
        console.error("Erro ao buscar dados da trilha:", err);
      }
    };

    fetchTrack();
  }, [token, user?.trackId]);

  if (!trackData) return <div>Carregando trilha...</div>;

  return <EvaluationComparisonGroupList trackData={trackData} cycleId={1} />;
}
