export interface Collaborator {
  id: number;
  name: string;
  role: string;
  status: "Em andamento" | "Finalizado";
  selfScore: number | null;
  managerScore: number | null;
}

export interface Props {
  collaborator: Collaborator;
}
