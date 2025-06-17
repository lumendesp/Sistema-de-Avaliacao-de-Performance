import EvaluationStatusButton from '../../components/EvaluationStatusButton/EvaluationStatusButton';

export default function Dashboard() {
  return (
    <div className="w-full flex flex-col gap-4">
        <EvaluationStatusButton status="aberto" ciclo="2025.1" diasRestantes={10} />
        <EvaluationStatusButton status="emBreve" ciclo="2025.2" />
        <EvaluationStatusButton status="disponivel" ciclo="2024.2" />
    </div>
  );
}
