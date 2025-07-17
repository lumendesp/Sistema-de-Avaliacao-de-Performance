import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import PeerEvaluationComparisonGroupList from "../../../components/ComparisonEvaluationForm/PeerEvaluationComparisonGroupList";
import { useOutletContext } from "react-router-dom";

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

export default function PeerEvaluationComparison() {
  const { token } = useAuth();
  const { selectedCycleId, selectedCycleName } = useOutletContext<OutletContextType>();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycle = async () => {
      try {
        const res = await fetch("http://localhost:3000/ciclos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCycles: Cycle[] = await res.json();

        let selected: Cycle | undefined;
        if (selectedCycleName) {
          selected = allCycles.find((c) => c.name === selectedCycleName);
        } else if (selectedCycleId) {
          const cleanCycleId = typeof selectedCycleId === "string"
            ? parseInt(selectedCycleId.split(":")[0], 10)
            : Number(selectedCycleId);
          selected = allCycles.find((c) => c.id === cleanCycleId);
        }

        if (selected) setCycle(selected);
      } catch (error) {
        console.error("Erro ao buscar ciclos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCycle();
  }, [token, selectedCycleId, selectedCycleName]);

  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full" />;
  if (!cycle)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full py-8 flex justify-center">
        <p className="text-sm text-gray-400 text-start">
          Nenhum ciclo encontrado.
        </p>
      </div>
    );

  return <PeerEvaluationComparisonGroupList cycleId={cycle.id} />;
}

