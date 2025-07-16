export type EvaluationStatus = 'aberto' | 'emBreve' | 'disponivel';

export interface EvaluationStatusButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: EvaluationStatus;
  ciclo: string;
  diasRestantes?: number;
  context?: 'collaborator' | 'manager' | 'mentor'; // novo prop
  originalStatus?: string; // status real do ciclo
}
