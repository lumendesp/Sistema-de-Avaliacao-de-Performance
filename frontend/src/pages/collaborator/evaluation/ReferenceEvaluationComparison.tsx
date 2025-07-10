import { useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import ReferenceEvaluationForm from "../../../components/ReferenceEvaluationForm/ReferenceEvaluationForm";
import { useAuth } from "../../../context/AuthContext";
import { fetchMyReferences } from "../../../services/api";
import type { Reference } from "../../../types/reference";

type OutletContextType = {
  selectedCycleId: number | null;
  selectedCycleName: string;
};

export default function ReferenceEvaluationComparison() {
  const { selectedCycleId } = useOutletContext<OutletContextType>();
  const { token } = useAuth();
  const [myReferences, setMyReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedCycleId) return;
    setLoading(true);
    fetchMyReferences(selectedCycleId)
      .then((data) => setMyReferences(data))
      .catch(() => setMyReferences([]))
      .finally(() => setLoading(false));
  }, [selectedCycleId, token]);

  if (!selectedCycleId)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-start">
          Selecione um ciclo para visualizar suas referências anteriores.
        </p>
      </div>
    );

  if (loading) return <div className="bg-[#f1f1f1] h-screen w-full" />;

  if (!myReferences.length)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-center">
          Nenhuma referência enviada para este ciclo.
        </p>
      </div>
    );

  return (
    <div className="p-3 bg-[#f1f1f1] space-y-6">
      <ReferenceEvaluationForm
        myReferences={myReferences}
        setMyReferences={setMyReferences}
        cycleId={selectedCycleId}
        isCycleFinished={true}
      />
    </div>
  );
}
