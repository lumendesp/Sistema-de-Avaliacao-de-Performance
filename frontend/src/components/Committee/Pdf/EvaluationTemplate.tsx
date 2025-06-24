interface EvaluationProps {
    name: string;
    role: string;
    autoAvaliacao: number;
    avaliacao360: number;
    notaGestor: number;
    notaFinal: number;
    resumo: string;
  }
  
  export function EvaluationTemplate({
    name, role, autoAvaliacao, avaliacao360, notaGestor, notaFinal, resumo
  }: EvaluationProps) {
    return (
      <div className="p-6 w-full text-gray-800">
        <h1 className="text-2xl font-bold mb-4">Evaluation Report</h1>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Role:</strong> {role}</p>
        <p><strong>Autoavaliação:</strong> {autoAvaliacao}</p>
        <p><strong>Avaliação 360:</strong> {avaliacao360}</p>
        <p><strong>Nota do Gestor:</strong> {notaGestor}</p>
        <p className="mb-4"><strong>Nota Final:</strong> {notaFinal}</p>
        <h2 className="text-xl font-semibold mb-2">Resumo</h2>
        <p>{resumo}</p>
      </div>
    );
  }
  