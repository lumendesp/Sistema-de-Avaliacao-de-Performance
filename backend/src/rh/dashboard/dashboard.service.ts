import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RHDashboardDto, CollaboratorStatusDto } from './dto/rh-dashboard.dto';
import { RhCollaboratorDto } from './dto/rh-collaborator.dto';

@Injectable()
export class RHDashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async getRHDashboardStatus(cycleId?: number): Promise<RHDashboardDto> {
        // Encontra o ciclo de avaliação ativo
        const activeCycle = await this.prisma.evaluationCycle.findFirst({
            where: cycleId ? { id: cycleId } : { status: 'IN_PROGRESS' },
        });

        if (!activeCycle) {
            throw new NotFoundException('Nenhum ciclo de avaliação ativo encontrado.');
        }

        // Consulta que busca usuários e a contagem de cada tipo de avaliação associada
        const allCollaborators = await this.prisma.user.findMany({
            where: {
                active: true,
                roles: { some: { role: 'COLLABORATOR' } },
            },
            select: {
                id: true,
                name: true,
                position: { select: { name: true } },
                unit: { select: { name: true } },
                _count: {
                    select: {
                        selfEvaluations: { where: { cycleId: activeCycle.id } },
                        peerEvaluationsReceived: { where: { cycleId: activeCycle.id } },
                        managerEvaluationsReceived: { where: { cycleId: activeCycle.id } },
                        finalScores: { where: { cycleId: activeCycle.id } },
                    },
                },
            },
        });

        let completedCount = 0;
        const collaboratorsStatus: CollaboratorStatusDto[] = allCollaborators.map((user) => {
            const nameParts = user.name.split(' ');
            const initials = ((nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')).toUpperCase();

            // A avaliação só é 'finalizada' se TODAS as partes estiverem completas
            const isComplete =
                user._count.selfEvaluations > 0 &&
                user._count.peerEvaluationsReceived > 0 &&
                user._count.managerEvaluationsReceived > 0 &&
                user._count.finalScores > 0;

            if (isComplete) {
                completedCount++;
            }

            return {
                id: user.id,
                name: user.name,
                role: user.position?.name || 'N/A',
                status: isComplete ? 'finalizado' : 'pendente',
                avatarInitials: initials,
                unit: user.unit?.name || 'N/A',
            };
        });

        // Calcula as métricas principais
        const totalEvaluations = allCollaborators.length;
        const pendingCount = totalEvaluations - completedCount;
        const completionPercentage = totalEvaluations > 0 ? Math.round((completedCount / totalEvaluations) * 100) : 0;

        const completionByUnit = this.getCompletionByUnit(allCollaborators);

        return {
            totalEvaluations,
            completedEvaluations: completedCount,
            pendingEvaluations: pendingCount,
            completionPercentage,
            collaborators: collaboratorsStatus,
            completionByUnit,
        };
    }

    private getCompletionByUnit(allCollaborators: any[]) {
        const unitMap = new Map<string, { total: number; completed: number }>();
        for (const user of allCollaborators) {
            const unitName = user.unit?.name || 'Sem Unidade';
            if (!unitMap.has(unitName)) {
                unitMap.set(unitName, { total: 0, completed: 0 });
            }
            const unitData = unitMap.get(unitName)!;
            unitData.total++;

            const isComplete =
                user._count.selfEvaluations > 0 &&
                user._count.peerEvaluationsReceived > 0 &&
                user._count.managerEvaluationsReceived > 0 &&
                user._count.finalScores > 0;

            if (isComplete) {
                unitData.completed++;
            }
        }
        return Array.from(unitMap.entries()).map(([unit, counts]) => ({
            unit,
            completedCount: counts.completed,
            totalCount: counts.total,
        }));
    }

    async getCollaboratorsList(cycleId?: number): Promise<RhCollaboratorDto[]> {
        const activeCycle = await this.prisma.evaluationCycle.findFirst({
            where: cycleId ? { id: cycleId } : { status: 'IN_PROGRESS' },
        });

        if (!activeCycle) {
            throw new NotFoundException('Nenhum ciclo de avaliação ativo encontrado.');
        }

        const allCollaborators = await this.prisma.user.findMany({
            where: {
                active: true,
                roles: { some: { role: 'COLLABORATOR' } },
            },
            include: {
                position: true,
                unit: true,
                finalScores: { where: { cycleId: activeCycle.id } },
                selfEvaluations: { where: { cycleId: activeCycle.id }, include: { items: { select: { score: true } } } },
                peerEvaluationsReceived: { where: { cycleId: activeCycle.id }, select: { score: true } },
                managerEvaluationsReceived: { where: { cycleId: activeCycle.id }, include: { items: { select: { score: true } } } },
            },
        });

        const formattedCollaborators: RhCollaboratorDto[] = allCollaborators.map((user) => {
            const nameParts = user.name.split(' ');
            const initials = ((nameParts[0]?.[0] || '') + (nameParts[nameParts.length - 1]?.[0] || '')).toUpperCase();

            // Lógica de status completa
            const isComplete =
                user.selfEvaluations.length > 0 &&
                user.peerEvaluationsReceived.length > 0 &&
                user.managerEvaluationsReceived.length > 0 &&
                user.finalScores.length > 0;

            // Lógica para calcular médias das notas para a pré-visualização
            const selfEvaluationItems = user.selfEvaluations[0]?.items;
            const selfScore = (selfEvaluationItems && selfEvaluationItems.length > 0)
                ? selfEvaluationItems.reduce((acc, item) => acc + item.score, 0) / selfEvaluationItems.length
                : undefined;

            const managerEvaluationItems = user.managerEvaluationsReceived[0]?.items;
            const managerScore = (managerEvaluationItems && managerEvaluationItems.length > 0)
                ? managerEvaluationItems.reduce((acc, item) => acc + item.score, 0) / managerEvaluationItems.length
                : undefined;

            const peerScores = user.peerEvaluationsReceived.map(p => p.score);
            const peerScore = peerScores.length > 0
                ? peerScores.reduce((acc, score) => acc + score, 0) / peerScores.length
                : undefined;

            const finalScore = user.finalScores[0]?.finalScore;

            return {
                id: user.id,
                name: user.name,
                avatarInitials: initials,
                role: user.position?.name || 'N/A',
                unit: user.unit?.name || 'N/A',
                status: isComplete ? 'finalizado' : 'pendente',
                autoAvaliacao: this.formatAverage(selfScore),
                avaliacao360: peerScore,
                notaGestor: managerScore,
                notaFinal: finalScore ?? undefined,
            };
        });

        return formattedCollaborators;
    }

    private formatAverage(value: number | null | undefined): number | undefined {
        if (typeof value !== 'number') {
            return undefined;
        }
        return parseFloat(value.toFixed(1));
    }
}