import EvaluationComparisonForm from "../../../components/ComparisonEvaluationForm/ComparisonEvaluationForm";

export default function ComparisonEvaluation() {
  const postureCriteria = [
    { title: "Sentimento de Dono" },
    { title: "Resiliência nas adversidades" },
    { title: "Trabalho em equipe" },
    { title: "Comunicação clara" },
  ];

  return (
    <div className="p-3 bg-[#f1f1f1]">
      <EvaluationComparisonForm title="Critérios de Postura" criteria={postureCriteria} />
    </div>
  );
}
