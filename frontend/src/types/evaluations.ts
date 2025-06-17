// src/types/evaluations.ts

export type EvaluationStatus = 'finalizado' | 'pendente';

export interface Collaborator {
    id: number;
    name: string;
    role: string;
    avatarInitials: string;
    status: EvaluationStatus;
    unit: string;
}