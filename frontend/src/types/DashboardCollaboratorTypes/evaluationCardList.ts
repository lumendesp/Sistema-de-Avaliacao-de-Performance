export interface CicloProps {
  ciclo: string;
  nota?: number;
  status: 'Em andamento' | 'Finalizado';
  resumo?: string;
  destaque?: string;
}
