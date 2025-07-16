import { useEffect, useState } from "react";
import ReferenceEvaluationForm from "../../../components/ReferenceEvaluationForm/ReferenceEvaluationForm";
import { useAuth } from "../../../context/AuthContext";
import { fetchMyReferences } from "../../../services/api";
import type { Reference } from "../../../types/reference";
import { useOutletContext } from "react-router-dom";

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

type OutletContextType = {
  selectedCycleId: number | null;
  selectedCycleName: string;
};

export default function ReferenceEvaluationComparison() {
  const { token } = useAuth();
  const { selectedCycleId, selectedCycleName } = useOutletContext<OutletContextType>();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [myReferences, setMyReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycleAndReferences = async () => {
      if (!selectedCycleId && !selectedCycleName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Buscar ciclos
        const res = await fetch("http://localhost:3000/ciclos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCycles: Cycle[] = await res.json();

        // Selecionar ciclo pelo nome ou ID
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
          const references = await fetchMyReferences(selected.id);
          setMyReferences(references);
        } else {
          setCycle(null);
          setMyReferences([]);
        }
      } catch (error) {
        console.error("Erro ao buscar ciclo/referências:", error);
        setCycle(null);
        setMyReferences([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCycleAndReferences();
  }, [token, selectedCycleId, selectedCycleName]);

  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full" />;

  if (!cycle)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full py-8 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-start">
          Nenhum ciclo encontrado.
        </p>
      </div>
    );

  if (!myReferences.length)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full py-8 flex justify-center">
        <p className="text-sm text-gray-400 text-center">
          Nenhuma referência enviada para este ciclo.
        </p>
      </div>
    );

  return (
    <div className="p-3 bg-[#f1f1f1] space-y-6 min-h-screen">
      <ReferenceEvaluationForm
        myReferences={myReferences}
        setMyReferences={setMyReferences}
        cycleId={cycle.id}
        isCycleFinished={true}
      />
    </div>
  );
}
