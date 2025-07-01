import EvaluationComparisonGroupList from "../../../components/ComparisonEvaluationForm/EvaluationComparisonGroupList";
import type { TrackWithGroups } from "../../../types/selfEvaluation";

// isso virá do backend em breve, mas pode ser passado como prop
const mockTrackData: TrackWithGroups = {
  id: 1,
  name: "Trilha Backend",
  CriterionGroup: [
    {
      id: 10,
      name: "Postura",
      configuredCriteria: [
        {
          id: 101,
          criterionId: 1,
          mandatory: true,
          criterion: {
            id: 1,
            name: "SENTIMENTO_DE_DONO",
            generalDescription: "Desenvolve senso de responsabilidade",
            active: true,
            weight: 1,
            displayName: "Sentimento de Dono",
          },
        },
        // ...
      ],
    },
    // outros grupos...
  ],
};

export default function ComparisonEvaluation() {
  return (
    <EvaluationComparisonGroupList trackData={mockTrackData} cycleId={1} />
  );
}
