import SelfEvaluationForm from "../../components/SelfEvaluation/SelfEvaluationForm";

export default function EvaluationPage() {
  const postureCriteria = [
    { title: "Sentimento de Dono" },
    { title: "Resiliência nas adversidades" },
    { title: "Trabalho em equipe" },
    { title: "Comunicação clara" },
  ];

  return (
    <div className="p-6 mx-auto">
      <SelfEvaluationForm title="Critérios de Postura" criteria={postureCriteria} />
    </div>
  );
}
