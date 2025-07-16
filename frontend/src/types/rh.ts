export interface CollaboratorStatus {
    id: number;
    name: string;
    role: string;
    status: 'finalizado' | 'pendente';
    avatarInitials: string;
    unit: string;
}

export interface RHDashboardData {
    totalEvaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    completionPercentage: number;
    collaborators: CollaboratorStatus[];
    completionByUnit: {
        unit: string;
        completedCount: number;
        totalCount: number;
    }[];
}

export interface RhCollaborator {
    id: number;
    name: string;
    role: string;
    avatarInitials: string;
    status: 'finalizado' | 'pendente' | 'expirado';
    unit: string;
    autoAvaliacao?: number;
    avaliacao360?: number;
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