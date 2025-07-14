export type EvaluationStatus = 'Em andamento' | 'Finalizado';

export interface EvaluationCardMiniProps {
  ciclo: string;
  nota?: number;
  status: string; 
  resumo?: string;
  destaque?: string;
  statusReal?: string; 
}