export type CicloProps = {
  ciclo: string;
  status: 'Finalizado' | 'Em andamento';
  resumo?: string;
  nota?: number;
  destaque?: string;
};