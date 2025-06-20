import SelfEvaluationForm from "../../../components/SelfEvaluationForm/SelfEvaluationForm";

export default function SelfEvaluationPage() {
  const postureCriteria = [
    { title: "Sentimento de Dono" },
    { title: "Resiliência nas adversidades" },
    { title: "Trabalho em equipe" },
    { title: "Comunicação clara" },
  ];

  return (
    <div className="p-6 bg-[#f1f1f1] mt-0">
      <SelfEvaluationForm title="Critérios de Postura" criteria={postureCriteria} />
    </div>
  );
}
