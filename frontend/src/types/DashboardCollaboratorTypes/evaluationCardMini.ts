export type EvaluationStatus = 'Em andamento' | 'Finalizado';

export interface EvaluationCardMiniProps {
  ciclo: string;
  nota?: number;
  status: EvaluationStatus;
  resumo?: string;
  destaque?: string;
}