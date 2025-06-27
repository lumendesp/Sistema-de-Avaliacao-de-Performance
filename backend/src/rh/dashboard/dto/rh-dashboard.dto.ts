import { ApiProperty } from '@nestjs/swagger';

// DTO para os dados do gráfico de barras
export class CompletionByUnitDto {
    @ApiProperty({ example: 'Tecnologia' })
    unit: string;

    @ApiProperty({ example: 2 })
    completedCount: number;

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

    @ApiProperty({ example: 'finalizado', enum: ['finalizado', 'pendente'] })
    status: 'finalizado' | 'pendente';
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

    @ApiProperty({ type: [CollaboratorStatusDto] })
    collaborators: CollaboratorStatusDto[];

    @ApiProperty({ type: [CompletionByUnitDto] })
    completionByUnit: CompletionByUnitDto[];
}