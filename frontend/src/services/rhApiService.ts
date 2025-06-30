import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

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

export const getRHDashboardData = async (cycleId?: number): Promise<RHDashboardData> => {
    try {
        const response = await apiClient.get('/rh/dashboard/status', {
            params: { cycleId },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard de RH:', error);
        throw error;
    }
};

export const getRhCollaborators = async (cycleId?: number): Promise<RhCollaborator[]> => {
    try {
        const response = await apiClient.get('/rh/dashboard/collaborators', {
            params: { cycleId },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar lista de colaboradores:', error);
        throw error;
    }
};