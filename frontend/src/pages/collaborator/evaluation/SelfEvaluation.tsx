import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import type { TrackWithGroups } from "../../../types/selfEvaluation";
import SelfEvaluationGroupList from "../../../components/SelfEvaluationForm/SelfEvaluationGroupList";
import { fetchActiveEvaluationCycle } from "../../../services/api"; // ajuste o caminho conforme sua estrutura

export default function SelfEvaluationPage() {
  const { token, user } = useAuth();
  const [trackGroups, setTrackGroups] = useState<TrackWithGroups | null>(null);
  const [loading, setLoading] = useState(true);
  const [cycleId, setCycleId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cycle = await fetchActiveEvaluationCycle();
        setCycleId(cycle?.id || null);

        const res = await axios.get("http://localhost:3000/rh-criteria/tracks/with-criteria", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userTrack = user?.trackId;
        const trackData = res.data.find((t: any) => t.id === userTrack);
        setTrackGroups(trackData || null);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user]);

  if (loading) {
    return <p className="text-center text-gray-500 mt-10">Carregando critérios...</p>;
  }

  if (!trackGroups || !cycleId) {
    return <p className="text-center text-gray-500 mt-10">Nenhum critério ou ciclo ativo encontrado.</p>;
  }

  return (
    <div className="p-3 bg-[#f1f1f1] mt-0">
      <SelfEvaluationGroupList trackData={trackGroups} cycleId={cycleId} />
    </div>
  );
}
