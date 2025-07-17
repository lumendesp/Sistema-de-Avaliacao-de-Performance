import { type EvaluationStatus } from './evaluations'

export interface CollaboratorStatus {
    id: number;
    name: string;
    role: string;
    status: EvaluationStatus;
    avatarInitials: string;
    unit: string;
}

export interface RHDashboardData {
    totalEvaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    completionPercentage: number;
    daysRemaining: number;
    cycleStatus: string;
    collaborators: CollaboratorStatus[];
    completionByTrack: {
        track: string;
        completedCount: number;
        inProgressCount: number;
        pendingCount: number;
        totalCount: number;
    }[];
}

export interface RhCollaborator {
    id: number;
    name: string;
    role: string;
    avatarInitials: string;
    status: EvaluationStatus;
    unit: string;
    autoAvaliacao?: number;
    avaliacao360?: number;
    notaMentor?: number;
    notaGestor?: number;
    notaFinal?: number;
}

export interface EvaluationCycle {
    id: number;
    name: string;
    status: string;
    startDate: Date;
    endDate: Date;
}

export interface FileProcessResult {
    status: 'success' | 'error';
    fileName: string;
    userName?: string;
    data?: { message: string;[key: string]: any };
    reason?: string;
}

export interface BulkImportResult {
    message: string;
    totalFiles: number;
    results: FileProcessResult[];
}