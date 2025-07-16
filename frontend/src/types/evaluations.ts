export type EvaluationStatus = 'finalizado' | 'pendente' | 'em_andamento';

export interface AssessmentScores {
    autoAvaliacao?: number;
    avaliacao360?: number;
    notaGestor?: number;
    notaFinal?: number;
}

export interface Collaborator {
    id: number;
    name: string;
    role: string;
    avatarInitials: string;
    status: EvaluationStatus;
    unit: string;
    autoAvaliacao?: number;
    avaliacao360?: number;
    notaGestor?: number;
    notaFinal?: number;
}