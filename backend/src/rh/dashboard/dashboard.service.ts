import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RHDashboardDto, CollaboratorStatusDto, CompletionByTrackDto } from './dto/rh-dashboard.dto';
import { RhCollaboratorDto } from './dto/rh-collaborator.dto';
import { CycleStatus } from '@prisma/client';

@Injectable()
export class RHDashboardService {
    constructor(private readonly prisma: PrismaService) { }

    private determineStatus(
        userCounts: {
            selfEvaluations: number;
            peerEvaluationsReceived: number;
            managerEvaluationsReceived: number;
            finalScores: number;
        },
        cycleStatus: CycleStatus
    ): 'finalizado' | 'em_andamento' | 'pendente' {

        const isComplete =
            userCounts.selfEvaluations > 0 &&
            userCounts.peerEvaluationsReceived > 0 &&
            userCounts.managerEvaluationsReceived > 0 &&
            userCounts.finalScores > 0;

        if (isComplete) {
            return 'finalizado';
        }

        if (cycleStatus === 'PUBLISHED') {
            return 'pendente';
        }

        return 'em_andamento';
    }

    async getRHDashboardStatus(cycleId?: number): Promise<RHDashboardDto> {
        // Encontra o ciclo de avaliação ativo
        const activeCycle = await this.prisma.evaluationCycle.findFirst({
            where: cycleId ? { id: cycleId } : {
                status: {
                    in: [
                        CycleStatus.IN_PROGRESS_COLLABORATOR,
                        CycleStatus.IN_PROGRESS_MANAGER,
                        CycleStatus.IN_PROGRESS_COMMITTEE,
                        CycleStatus.CLOSED,
                        CycleStatus.PUBLISHED,
                    ],
                },
            },
            orderBy: { startDate: 'desc' }
        });

        if (!activeCycle) {
            throw new NotFoundException('Nenhum ciclo de avaliação ativo encontrado.');
        }

        //Cálculo de dias restantes
        const today = new Date();
        const endDate = new Date(activeCycle.endDate);
        // Garante que estamos comparando apenas as datas, sem as horas
        today.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const diffTime = endDate.getTime() - today.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

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
                track: { select: { name: true } },
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

            const status = this.determineStatus(user._count, activeCycle.status);
            if (status === 'finalizado') {
                completedCount++;
            }

            return {
                id: user.id,
                name: user.name,
                role: user.position?.name || 'N/A',
                status: status,
                avatarInitials: initials,
                unit: user.unit?.name || 'N/A',
            };
        });

        // Calcula as métricas principais
        const totalEvaluations = allCollaborators.length;
        const pendingCount = totalEvaluations - completedCount;
        const completionPercentage = totalEvaluations > 0 ? Math.round((completedCount / totalEvaluations) * 100) : 0;

        const completionByTrack = this.getCompletionByTrack(allCollaborators, activeCycle.status);

        return {
            totalEvaluations,
            completedEvaluations: completedCount,
            pendingEvaluations: pendingCount,
            completionPercentage,
            daysRemaining,
            cycleStatus: activeCycle.status,
            collaborators: collaboratorsStatus,
            completionByTrack,
        };
    }

    private getCompletionByTrack(allCollaborators: any[], cycleStatus: CycleStatus) {
        const trackMap = new Map<string, { total: number; completed: number; inProgress: number; pending: number; }>();
        for (const user of allCollaborators) {
            const trackName = user.track?.name || 'Sem Trilha';
            if (!trackMap.has(trackName)) {
                trackMap.set(trackName, { total: 0, completed: 0, inProgress: 0, pending: 0 });
            }
            const trackData = trackMap.get(trackName)!;
            trackData.total++;

            const status = this.determineStatus(user._count, cycleStatus);
            if (status === 'finalizado') {
                trackData.completed++;
            } else if (status === 'em_andamento') {
                trackData.inProgress++;
            } else {
                trackData.pending++;
            }
        }
        return Array.from(trackMap.entries()).map(([track, counts]) => ({
            track,
            completedCount: counts.completed,
            inProgressCount: counts.inProgress,
            pendingCount: counts.pending,
            totalCount: counts.total,
        }));
    }

    async getCollaboratorsList(cycleId?: number, searchTerm?: string): Promise<RhCollaboratorDto[]> {
        const activeCycle = await this.prisma.evaluationCycle.findFirst({
            where: cycleId ? { id: cycleId } : {
                status: {
                    in: [
                        CycleStatus.IN_PROGRESS_COLLABORATOR,
                        CycleStatus.IN_PROGRESS_MANAGER,
                        CycleStatus.IN_PROGRESS_COMMITTEE,
                        CycleStatus.CLOSED,
                        CycleStatus.PUBLISHED,
                    ],
                },
            },
            orderBy: { startDate: 'desc' }
        });

        if (!activeCycle) {
            throw new NotFoundException('Nenhum ciclo de avaliação ativo encontrado.');
        }

        const allCollaborators = await this.prisma.user.findMany({
            where: {
                active: true,
                roles: { some: { role: 'COLLABORATOR' } },
                ...(searchTerm && {
                    name: {
                        contains: searchTerm,
                    },
                }),
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
            const status = this.determineStatus({
                selfEvaluations: user.selfEvaluations.length,
                peerEvaluationsReceived: user.peerEvaluationsReceived.length,
                managerEvaluationsReceived: user.managerEvaluationsReceived.length,
                finalScores: user.finalScores.length,
            }, activeCycle.status);

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
                status: status,
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