import { ApiProperty } from '@nestjs/swagger';

// DTO para os dados do gráfico de barras
export class CompletionByTrackDto {
    @ApiProperty({ example: 'Trilha do Colaborador' })
    track: string;

    @ApiProperty({ example: 2 })
    completedCount: number;

    @ApiProperty({ example: 1, description: 'Total de avaliações em andamento na trilha.' })
    inProgressCount: number;

    @ApiProperty({ example: 1, description: 'Total de avaliações pendentes na trilha.' })
    pendingCount: number;

    @ApiProperty({ example: 4 })
    totalCount: number;
}

// DTO para a lista de colaboradores
export class CollaboratorStatusDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Ana Silva' })
    name: string;

    @ApiProperty({ example: 'Designer de Produto' })
    role: string;

    @ApiProperty({ example: 'finalizado', enum: ['finalizado', 'pendente', 'em_andamento'] })
    status: 'finalizado' | 'pendente' | 'em_andamento';

    @ApiProperty({ example: 'AS' })
    avatarInitials: string;

    @ApiProperty({ example: 'Tecnologia' })
    unit: string;
}

// DTO principal para a resposta completa do dashboard
export class RHDashboardDto {
    @ApiProperty({ example: 7 })
    totalEvaluations: number;

    @ApiProperty({ example: 3 })
    completedEvaluations: number;

    @ApiProperty({ example: 4 })
    pendingEvaluations: number;

    @ApiProperty({ example: 43 })
    completionPercentage: number;

    @ApiProperty({ example: 30, description: 'Dias restantes para o fim do ciclo.' })
    daysRemaining: number;

    @ApiProperty({ type: [CollaboratorStatusDto] })
    collaborators: CollaboratorStatusDto[];

    @ApiProperty({ type: [CompletionByTrackDto] })
    completionByTrack: CompletionByTrackDto[];
}