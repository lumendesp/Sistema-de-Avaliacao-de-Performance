import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RHDashboardDto, CollaboratorStatusDto } from './dto/rh-dashboard.dto';

@Injectable()
export class RHDashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getHrDashboardStatus(cycleId?: number): Promise<RHDashboardDto> {
        // 1. Encontra o ciclo de avaliação ativo
        const activeCycle = await this.prisma.evaluationCycle.findFirst({
            where: cycleId ? { id: cycleId } : { status: 'IN_PROGRESS' },
        });

        if (!activeCycle) {
            throw new NotFoundException('Nenhum ciclo de avaliação ativo encontrado.');
        }

        // 2. Busca todos os colaboradores relevantes
        const allCollaborators = await this.prisma.user.findMany({
            where: {
                active: true,
                roles: { some: { role: 'COLLABORATOR' } },
            },
            include: {
                position: true,
                unit: true,
            },
        });

        // 3. Busca todas as autoavaliações finalizadas para o ciclo
        const completedEvaluations = await this.prisma.selfEvaluation.findMany({
            where: { cycleId: activeCycle.id },
            select: { userId: true },
        });
        const completedUserIds = new Set(completedEvaluations.map((e) => e.userId));

        // 4. Calcula as métricas principais
        const totalEvaluations = allCollaborators.length;
        const completedCount = completedUserIds.size;
        const pendingCount = totalEvaluations - completedCount;
        const completionPercentage =
            totalEvaluations > 0 ? Math.round((completedCount / totalEvaluations) * 100) : 0;

        // 5. Formata a lista de colaboradores com status
        const collaboratorsStatus: CollaboratorStatusDto[] = allCollaborators.map((user) => {
            const nameParts = user.name.split(' ');
            const initials = (
                (nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')
            ).toUpperCase();

            return {
                id: user.id,
                name: user.name,
                role: user.position?.name || 'N/A',
                status: completedUserIds.has(user.id) ? 'finalizado' : 'pendente',
                avatarInitials: initials,
                unit: user.unit?.name || 'N/A',
            };
        });

        // 6. Calcula o preenchimento por unidade
        const completionByUnit = await this.getCompletionByUnit(allCollaborators, completedUserIds);

        // 7. Retorna o DTO completo (agora sem erros)
        return {
            totalEvaluations,
            completedEvaluations: completedCount,
            pendingEvaluations: pendingCount,
            completionPercentage,
            collaborators: collaboratorsStatus,
            completionByUnit,
        };
    }

    private async getCompletionByUnit(
        allCollaborators: any[],
        completedUserIds: Set<number>,
    ) {
        const unitMap = new Map<string, { total: number; completed: number }>();

        for (const user of allCollaborators) {
            const unitName = user.unit?.name || 'Sem Unidade';
            if (!unitMap.has(unitName)) {
                unitMap.set(unitName, { total: 0, completed: 0 });
            }
            const unitData = unitMap.get(unitName)!;
            unitData.total++;
            if (completedUserIds.has(user.id)) {
                unitData.completed++;
            }
        }

        return Array.from(unitMap.entries()).map(
            ([unit, counts]) => ({
                unit,
                completedCount: counts.completed,
                totalCount: counts.total,
            }),
        );
    }
}