export type EvaluationStatus = 'aberto' | 'emBreve' | 'disponivel';

export interface EvaluationStatusButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: EvaluationStatus;
  ciclo: string;
  diasRestantes?: number;
}
