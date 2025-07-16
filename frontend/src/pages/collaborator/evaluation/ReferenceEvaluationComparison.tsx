import { useEffect, useState } from "react";
import ReferenceEvaluationForm from "../../../components/ReferenceEvaluationForm/ReferenceEvaluationForm";
import { useAuth } from "../../../context/AuthContext";
import { fetchMyReferences } from "../../../services/api";
import type { Reference } from "../../../types/reference";

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

export default function ReferenceEvaluationComparison() {
  const { token } = useAuth();
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [myReferences, setMyReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCycleAndReferences = async () => {
      setLoading(true);
      try {
        // Busca ciclos e filtra
        const res = await fetch("http://localhost:3000/ciclos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const allCycles: Cycle[] = await res.json();
        const selected = allCycles.find(
          (c) => c.status !== "IN_PROGRESS_COLLABORATOR"
        ) || allCycles[0];

        if (selected) {
          setCycle(selected);

          // Busca referências
          const references = await fetchMyReferences(selected.id);
          setMyReferences(references);
        } else {
          setMyReferences([]);
        }
      } catch (error) {
        console.error("Erro ao buscar ciclo/referências:", error);
        setMyReferences([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCycleAndReferences();
  }, [token]);

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
