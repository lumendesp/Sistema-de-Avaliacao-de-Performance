export interface Collaborator {
  id: number;
  name: string;
  role: string;
  status: "Em andamento" | "Finalizado";
  selfScore: number;
  managerScore: number | null;
}

export interface Props {
  collaborator: Collaborator;
}
