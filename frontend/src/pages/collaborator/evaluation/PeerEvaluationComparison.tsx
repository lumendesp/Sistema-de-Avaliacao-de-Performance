import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import PeerEvaluationComparisonGroupList from "../../../components/ComparisonEvaluationForm/PeerEvaluationComparisonGroupList";

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

export default function PeerEvaluationComparison() {
  const { token } = useAuth();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const res = await fetch("http://localhost:3000/ciclos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCycles: Cycle[] = await res.json();

        const selected = allCycles.find(
          (c) => c.status !== "IN_PROGRESS_COLLABORATOR"
        );

        if (selected) setCycle(selected);
      } catch (error) {
        console.error("Erro ao buscar ciclos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCycles();
  }, [token]);

  if (loading) {
    return <div className="bg-[#f1f1f1] h-screen w-full" />;
  }

  if (!cycle) {
    return (
      <div className="bg-[#f1f1f1] h-screen w-full py-8 flex justify-center">
        <p className="text-sm text-gray-400 text-start">
          Nenhum ciclo encontrado.
        </p>
      </div>
    );
  }

  return <PeerEvaluationComparisonGroupList cycleId={cycle.id} />;
}
