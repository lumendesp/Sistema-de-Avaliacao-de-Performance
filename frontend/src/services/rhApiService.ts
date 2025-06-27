import axios from 'axios';

// Crie uma instância do Axios com a URL base da sua API
const apiClient = axios.create({
    baseURL: 'http://localhost:3000', // A URL base do seu backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Definimos o tipo de dado que esperamos receber da API
// Este DTO deve ser idêntico ao que definimos no backend
export interface RHDashboardData {
    totalEvaluations: number;
    completedEvaluations: number;
    pendingEvaluations: number;
    completionPercentage: number;
    collaborators: {
        id: number;
        name: string;
        role: string;
        status: 'finalizado' | 'pendente';
    }[];
    completionByUnit: {
        unit: string;
        completedCount: number;
        totalCount: number;
    }[];
}

// Função que busca os dados do dashboard
export const getRHDashboardData = async (cycleId?: number): Promise<RHDashboardData> => {
    try {
        const response = await apiClient.get('/rh/dashboard/status', {
            params: { cycleId }, // Envia o cycleId como query param se ele for fornecido
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar dados do dashboard de RH:', error);
        // Em um app real, você poderia tratar o erro de forma mais robusta
        throw error;
    }
};