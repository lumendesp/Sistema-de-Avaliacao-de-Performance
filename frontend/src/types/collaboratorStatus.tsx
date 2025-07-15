export interface Collaborator {
  id: number;
  name: string;
  role: string;
  status: "Pendente" | "Em andamento" | "Finalizado";
  selfScore: number | null;
  managerScore: number | null;
  mentorScore?: number | null; // Adicionado para nota do mentor
}

export interface Props {
  collaborator: Collaborator;
}
