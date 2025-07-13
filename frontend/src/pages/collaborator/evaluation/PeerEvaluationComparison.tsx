import { useOutletContext } from "react-router-dom";
import PeerEvaluationComparisonGroupList from "../../../components/ComparisonEvaluationForm/PeerEvaluationComparisonGroupList";

type OutletContextType = {
  selectedCycleId: number | null;
  selectedCycleName: string;
};

export default function PeerEvaluationComparison() {
  const { selectedCycleId } = useOutletContext<OutletContextType>();

  if (!selectedCycleId)
    return (
      <div className="bg-[#f1f1f1] h-screen w-full p-3 flex items-center justify-center">
        <p className="text-sm text-gray-400 text-start">
          Selecione um ciclo para visualizar suas avaliações de pares
          anteriores.
        </p>
      </div>
    );

  return <PeerEvaluationComparisonGroupList cycleId={selectedCycleId} />;
}
