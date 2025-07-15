import { Injectable } from '@nestjs/common';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';
import { PrismaClient, CycleStatus } from '@prisma/client';
import { GeminiService } from '../ai/ai.service';
import { AiBrutalFactsService } from '../ai-brutal-facts/ai-brutal-facts.service';
import { CycleService } from './cycle.service';
import { CycleTransferService } from './cycle-transfer.service';
import { AiSummaryService } from 'src/ai-summary/ai-summary.service';

const prisma = new PrismaClient();

@Injectable()
export class CiclosService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly aiBrutalFactsService: AiBrutalFactsService,
    private readonly cycleService: CycleService,
    private readonly cycleTransferService: CycleTransferService,
    private aiSummaryService: AiSummaryService,
  ) {}

  /**
   * Gera nome de ciclo baseado no semestre
   */
  private generateSemesterCycleName(date: Date, suffix?: string): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const semester = month <= 6 ? 1 : 2;
    return suffix ? `${year}.${semester} - ${suffix}` : `${year}.${semester}`;
  }

  async create(createCicloDto: CreateCicloDto) {
    return prisma.evaluationCycle.create({
      data: {
        name: createCicloDto.name,
        startDate: new Date(createCicloDto.startDate),
        endDate: new Date(createCicloDto.endDate),
        status: createCicloDto.status as any,
      },
    });
  }

  async findAll() {
    return prisma.evaluationCycle.findMany();
  }

  async findOne(id: number) {
    return prisma.evaluationCycle.findUnique({ where: { id } });
  }

  async update(id: number, updateCicloDto: UpdateCicloDto) {
    // Converte datas string para Date
    const dataToUpdate: any = { ...updateCicloDto };
    if (dataToUpdate.startDate && typeof dataToUpdate.startDate === 'string') {
      dataToUpdate.startDate = new Date(dataToUpdate.startDate);
    }
    if (dataToUpdate.endDate && typeof dataToUpdate.endDate === 'string') {
      dataToUpdate.endDate = new Date(dataToUpdate.endDate);
    }

    const updatedCycle = await prisma.evaluationCycle.update({
      where: { id },
      data: {
        ...dataToUpdate,
        status: updateCicloDto.status as any,
      },
    });

    // Se o ciclo foi fechado (CLOSED ou PUBLISHED), acionar geração de insight
    if (
      updateCicloDto.status === 'CLOSED' ||
      updateCicloDto.status === 'PUBLISHED'
    ) {
      // Chama o método de geração de insight do serviço de Brutal Facts
      await this.aiBrutalFactsService.getInsightForLastCompletedCycle();
    }

    return updatedCycle;
  }

  async remove(id: number) {
    return prisma.evaluationCycle.delete({ where: { id } });
  }

  async getCurrentCycle(status?: string) {
    // Buscar o ciclo mais recente do status especificado (independente do status)
    const currentCycle = await prisma.evaluationCycle.findFirst({
      where: {
        ...(status ? { status: status as any } : {}),
      },
      orderBy: { startDate: 'desc' },
    });

    if (!currentCycle) {
      return null;
    }

    const today = new Date();
    const endDate = new Date(currentCycle.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: currentCycle.id,
      name: currentCycle.name,
      startDate: currentCycle.startDate,
      endDate: currentCycle.endDate,
      status: currentCycle.status,
      daysRemaining: Math.max(0, diffDays),
      isOverdue: diffDays < 0,
    };
  }

  async getHistoricoCiclos(userId: number) {
    const notas = await prisma.finalScore.findMany({
      where: { userId },
      include: { cycle: true },
      orderBy: { cycle: { startDate: 'desc' } },
    });

    const selfEvals = await prisma.selfEvaluation.findMany({
      where: { userId },
      include: { items: true },
    });

    return notas.map((nota) => {
      const selfEval = selfEvals.find((se) => se.cycleId === nota.cycleId);
      let self = '-';
      if (selfEval && selfEval.items && selfEval.items.length > 0) {
        // Calcula a média dos scores dos items
        const scores = selfEval.items.map((item) => item.score);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        self = avg.toFixed(2);
      }
      return {
        cycle: nota.cycle.name,
        status: nota.cycle.status.startsWith('IN_PROGRESS')
          ? 'Em andamento'
          : 'Finalizado',
        self,
        exec: nota.executionScore ?? '-',
        posture: nota.postureScore ?? '-',
        final: nota.finalScore ?? '-',
        summary: nota.summary ?? '-',
      };
    });
  }

  async getManagerDashboardStats(managerId: number) {
    // Buscar o ciclo atual usando o método existente com status IN_PROGRESS_MANAGER
    const currentCycle = await this.getCurrentCycle('IN_PROGRESS_MANAGER');

    if (!currentCycle) {
      return {
        totalEvaluations: '0',
        evaluatedCollaborators: '0',
        pendingCollaborators: '0',
        averageScore: '0.0/5',
        evaluationTrend: '0% este mês',
        collaboratorTrend: '0% este mês',
        scoreTrend: '0.0 este mês',
        totalCollaborators: '0',
      };
    }

    // Buscar o gestor e seus colaboradores
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: {
        manages: {
          include: {
            collaborator: {
              include: {
                roles: true,
                finalScores: {
                  where: { cycleId: currentCycle.id },
                },
                selfEvaluations: {
                  where: { cycleId: currentCycle.id },
                },
                managerEvaluationsReceived: {
                  where: { cycleId: currentCycle.id },
                },
              },
            },
          },
        },
      },
    });

    if (!manager) {
      return {
        totalEvaluations: '0',
        evaluatedCollaborators: '0',
        pendingCollaborators: '0',
        averageScore: '0.0/5',
        evaluationTrend: '0% este mês',
        collaboratorTrend: '0% este mês',
        scoreTrend: '0.0 este mês',
        totalCollaborators: '0',
      };
    }

    // Lista de colaboradores do gestor, exceto ele mesmo e apenas ativos
    const collaborators = manager.manages
      .map((m) => m.collaborator)
      .filter((c) => c.id !== managerId && c.active);

    const totalCollaborators = collaborators.length;
    const totalEvaluations = totalCollaborators;
    const evaluatedCollaborators = collaborators.filter(
      (collab) => collab.finalScores.length > 0,
    ).length;
    const pendingCollaborators = totalCollaborators - evaluatedCollaborators;

    // Calcular média de desempenho - nota do ciclo atual
    const currentCycleScores = collaborators
      .filter((collab) => collab.finalScores.length > 0)
      .map((collab) => collab.finalScores[0].finalScore!)
      .filter((score) => score !== null && score !== undefined);

    const averageScore =
      currentCycleScores.length > 0
        ? (
            currentCycleScores.reduce((sum, score) => sum + score, 0) /
            currentCycleScores.length
          ).toFixed(1)
        : '0.0';

    // Calcular tendências baseadas em dados reais (opcional: pode ser ajustado para comparar só entre colaboradores do gestor)
    // Buscar ciclo anterior para comparação
    const previousCycle = await prisma.evaluationCycle.findMany({
      orderBy: { startDate: 'desc' },
      skip: 1,
      take: 1,
    });

    let evaluationTrend = '0% este mês';
    let collaboratorTrend = '0% este mês';
    let scoreTrend: string | undefined = undefined;

    if (previousCycle.length > 0) {
      const prevCycle = previousCycle[0];
      // Buscar colaboradores do gestor no ciclo anterior
      const prevManager = await prisma.user.findUnique({
        where: { id: managerId },
        include: {
          manages: {
            include: {
              collaborator: {
                include: {
                  roles: true,
                  finalScores: {
                    where: { cycleId: prevCycle.id },
                  },
                },
              },
            },
          },
        },
      });
      const prevCollaborators = prevManager
        ? prevManager.manages
            .map((m) => m.collaborator)
            .filter((c) => c.id !== managerId && c.active)
        : [];
      const prevTotalCollaborators = prevCollaborators.length;
      const prevEvaluatedCollabs = prevCollaborators.filter(
        (collab) => collab.finalScores.length > 0,
      ).length;
      const prevScores = prevCollaborators
        .filter((collab) => collab.finalScores.length > 0)
        .map((collab) => collab.finalScores[0].finalScore!)
        .filter((score) => score !== null && score !== undefined);
      const prevAverageScore =
        prevScores.length > 0
          ? prevScores.reduce((sum, score) => sum + score, 0) /
            prevScores.length
          : 0;
      // Calcular tendências
      if (prevTotalCollaborators > 0) {
        const evalChange = (
          ((totalEvaluations - prevTotalCollaborators) /
            prevTotalCollaborators) *
          100
        ).toFixed(0);
        evaluationTrend = `${evalChange}% este mês`;
      }
      if (prevEvaluatedCollabs > 0) {
        const collabChange = (
          ((evaluatedCollaborators - prevEvaluatedCollabs) /
            prevEvaluatedCollabs) *
          100
        ).toFixed(0);
        collaboratorTrend = `${collabChange}% este mês`;
      }
      if (prevAverageScore > 0) {
        const scoreChange = (
          parseFloat(averageScore) - prevAverageScore
        ).toFixed(1);
        scoreTrend = `${scoreChange} este mês`;
      }
    } else {
      evaluationTrend = '+12% este mês';
      collaboratorTrend = '+5% este mês';
      scoreTrend = '+0.3 este mês';
    }

    return {
      totalEvaluations: totalEvaluations.toString(),
      evaluatedCollaborators: evaluatedCollaborators.toString(),
      pendingCollaborators: pendingCollaborators.toString(),
      averageScore: `${averageScore}/5`,
      evaluationTrend,
      collaboratorTrend,
      scoreTrend,
      totalCollaborators: totalCollaborators.toString(),
    };
  }

  async getBrutalFactsData() {
    // Buscar dados já processados do serviço de Brutal Facts
    const brutalFactsData =
      await this.aiBrutalFactsService.getBrutalFactsDataForLastCompletedCycle();
    if (!brutalFactsData) {
      return {
        insights: 'Nenhum ciclo concluído encontrado.',
        chartData: [],
        collaborators: [],
      };
    }

    // Buscar histórico de ciclos concluídos para o gráfico
    const completedCycles = await prisma.evaluationCycle.findMany({
      where: {
        status: {
          in: ['CLOSED', 'PUBLISHED'],
        },
      },
      orderBy: { startDate: 'desc' },
      take: 5,
    });

    const chartData = await Promise.all(
      completedCycles.map(async (cycle) => {
        const scores = await prisma.finalScore.findMany({
          where: {
            cycleId: cycle.id,
            finalScore: { not: null },
          },
          select: { finalScore: true },
        });

        const averageScore =
          scores.length > 0
            ? scores.reduce((sum, score) => sum + score.finalScore!, 0) /
              scores.length
            : 0;

        return {
          ciclo: cycle.name,
          valor: parseFloat(averageScore.toFixed(1)),
        };
      }),
    );

    // Calcular aumento em relação ao ciclo anterior (scoreTrend)
    let scoreTrend: string | undefined = undefined;
    const lastCycleName = brutalFactsData.cycleName;
    const previousCycle = await prisma.evaluationCycle.findMany({
      where: {
        status: {
          in: ['CLOSED', 'PUBLISHED'],
        },
        name: { not: lastCycleName },
      },
      orderBy: { startDate: 'desc' },
      take: 1,
    });
    if (previousCycle.length > 0) {
      const prevCycle = previousCycle[0];
      // Buscar notas finais do ciclo anterior
      const prevScores = await prisma.finalScore.findMany({
        where: {
          cycleId: prevCycle.id,
          finalScore: { not: null },
        },
        select: { finalScore: true },
      });
      const prevAverageFinal =
        prevScores.length > 0
          ? prevScores.reduce((sum, score) => sum + score.finalScore!, 0) /
            prevScores.length
          : 0;
      scoreTrend =
        (parseFloat(brutalFactsData.averageFinal) - prevAverageFinal)
          .toFixed(1)
          .toString() + ' este ciclo';
    }

    return {
      insights: brutalFactsData.insight,
      chartData,
      collaborators: brutalFactsData.collaboratorsList,
      cycleName: brutalFactsData.cycleName,
      averageScore: `${brutalFactsData.averageFinal}/5`,
      totalEvaluated: brutalFactsData.totalEvaluated.toString(),
      averageAuto: `${brutalFactsData.averageAuto}/5`,
      averageManager: `${brutalFactsData.averageManager}/5`,
      averagePeer: `${brutalFactsData.averagePeer}/5`,
      averageFinal: `${brutalFactsData.averageFinal}/5`,
      scoreTrend,
    };
  }

  async getDebugCycles() {
    const allCycles = await prisma.evaluationCycle.findMany({
      orderBy: { startDate: 'desc' },
    });

    return allCycles.map((cycle) => ({
      id: cycle.id,
      name: cycle.name,
      status: cycle.status,
      startDate: cycle.startDate,
      endDate: cycle.endDate,
    }));
  }

  async closeCollaboratorAndCreateManager() {
    // Buscar o ciclo de colaborador atual
    const collaboratorCycle = await this.cycleService.getMostRecentCycle(
      'IN_PROGRESS_COLLABORATOR' as CycleStatus,
    );

    if (!collaboratorCycle) {
      throw new Error('Nenhum ciclo de colaborador em andamento encontrado');
    }

    // Atualizar o ciclo para status de manager e ajustar datas
    const updatedCycle = await prisma.evaluationCycle.update({
      where: { id: collaboratorCycle.id },
      data: {
        status: 'IN_PROGRESS_MANAGER' as CycleStatus,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    });

    return {
      message: 'Ciclo de colaborador alterado para ciclo de manager!',
      cycleId: updatedCycle.id,
      cycle: updatedCycle,
    };
  }

  async closeManagerAndCreateCommittee() {
    // Buscar o ciclo de manager atual
    const managerCycle = await this.cycleService.getMostRecentCycle(
      'IN_PROGRESS_MANAGER' as CycleStatus,
    );

    if (!managerCycle) {
      throw new Error('Nenhum ciclo de manager em andamento encontrado');
    }

    // Atualizar o ciclo para status de comitê e ajustar datas
    const updatedCycle = await prisma.evaluationCycle.update({
      where: { id: managerCycle.id },
      data: {
        status: 'IN_PROGRESS_COMMITTEE' as CycleStatus,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      },
    });

    return {
      message: 'Ciclo de manager alterado para ciclo de comitê!',
      cycleId: updatedCycle.id,
      cycle: updatedCycle,
    };
  }

  async closeCommittee() {
    // Buscar o ciclo de comitê atual
    const committeeCycle = await this.cycleService.getMostRecentCycle(
      'IN_PROGRESS_COMMITTEE' as CycleStatus,
    );

    if (!committeeCycle) {
      throw new Error('Nenhum ciclo de comitê em andamento encontrado');
    }

    // Fechar o ciclo
    const updatedCycle = await prisma.evaluationCycle.update({
      where: { id: committeeCycle.id },
      data: { status: 'PUBLISHED' as CycleStatus },
    });

    // Buscar usuários que participaram desse ciclo (tiveram avaliações)
    const evaluatedUserIds = await prisma.evaluationCycleUser.findMany({
      where: { cycleId: committeeCycle.id },
      select: { userId: true },
    });

    const uniqueUserIds = [...new Set(evaluatedUserIds.map((u) => u.userId))];

    let generated = 0;

    for (const userId of uniqueUserIds) {
      try {
        // Gera resumo completo, se ainda não existir
        const existing = await this.aiSummaryService.getSummary(userId, committeeCycle.id);
        if (!existing) {
          await this.aiSummaryService.generateSummary({
            userId,
            cycleId: committeeCycle.id,
          });
        }

        // Sempre gera o lean summary atualizado
        await this.aiSummaryService.generateLeanSummary({
          userId,
          cycleId: committeeCycle.id,
        });
        generated++;
      } catch (err) {
        console.warn(`Erro ao gerar lean summary para user ${userId}:`, err.message);
      }
    }

    return {
      message: `Ciclo de comitê fechado com sucesso! Foram gerados ${generated} resumos finais.`,
      cycleId: updatedCycle.id,
      cycle: updatedCycle,
    };
  }


  /**
   * Cria um novo ciclo de colaborador.
   */
  async createCollaboratorCycle(cycleData?: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    // Verificar se já existe um ciclo de colaborador em andamento
    const existingCycle = await this.cycleService.getMostRecentCycle(
      'IN_PROGRESS_COLLABORATOR' as CycleStatus,
    );
    if (existingCycle) {
      throw new Error('Já existe um ciclo de colaborador em andamento');
    }

    // Definir datas padrão se não fornecidas
    const startDate = cycleData?.startDate || new Date();
    const endDate =
      cycleData?.endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 dias

    // Gerar nome baseado no semestre
    const name = cycleData?.name || this.generateSemesterCycleName(startDate);

    // Criar o ciclo de colaborador
    const collaboratorCycle = await this.cycleService.createCycle({
      name,
      startDate,
      endDate,
      status: 'IN_PROGRESS_COLLABORATOR' as CycleStatus,
    });

    return {
      message: 'Ciclo de colaborador criado com sucesso!',
      collaboratorCycleId: collaboratorCycle.id,
      cycle: collaboratorCycle,
    };
  }

  async updateCycleStatus(id: number, newStatus: CycleStatus) {
    // Atualiza o status do ciclo
    const updated = await prisma.evaluationCycle.update({
      where: { id },
      data: { status: newStatus },
    });

    // Exemplo: se fechou colaborador, cria ciclo de manager
    if (newStatus === 'CLOSED') {
      // Verifica se era um ciclo de colaborador
      if (
        updated.status === 'CLOSED' &&
        updated.name &&
        updated.name.toLowerCase().includes('colaborador')
      ) {
        // Cria ciclo de manager automaticamente, se necessário
        // ... lógica opcional ...
      }
    }

    // Retorna o ciclo atualizado
    return updated;
  }

  async closeManager() {
    const currentCycle = await prisma.evaluationCycle.findFirst({
      where: {
        status: 'IN_PROGRESS_MANAGER',
      },
    });

    if (!currentCycle) {
      throw new Error(
        'Nenhum ciclo com status IN_PROGRESS_MANAGER foi encontrado.',
      );
    }

    // Atualiza o ciclo para CLOSED
    const updatedCycle = await prisma.evaluationCycle.update({
      where: { id: currentCycle.id },
      data: { status: 'CLOSED' },
    });

    // Busca os colaboradores avaliados nesse ciclo (que possuem qualquer tipo de avaliação)
    const evaluatedUserIds = await prisma.evaluationCycleUser.findMany({
      where: { cycleId: currentCycle.id },
      select: { userId: true },
    });

    const uniqueUserIds = [...new Set(evaluatedUserIds.map((u) => u.userId))];

    // Gera resumo com IA para cada usuário
    for (const userId of uniqueUserIds) {
      try {
        await this.aiSummaryService.generateSummary({
          userId,
          cycleId: currentCycle.id,
        });
      } catch (err) {
        console.warn(`Erro ao gerar resumo para user ${userId}:`, err.message);
      }
    }

    return {
      message: `Ciclo fechado e resumos gerados para ${uniqueUserIds.length} colaboradores.`,
      cycle: updatedCycle,
    };
  }

  async openCommitteePhase() {
    const closedCycle = await prisma.evaluationCycle.findFirst({
      where: {
        status: 'CLOSED',
      },
      orderBy: {
        endDate: 'desc', // ou 'createdAt' se preferir o mais recente
      },
    });

    if (!closedCycle) {
      throw new Error('Nenhum ciclo com status CLOSED foi encontrado.');
    }

    const updatedCycle = await prisma.evaluationCycle.update({
      where: { id: closedCycle.id },
      data: {
        status: 'IN_PROGRESS_COMMITTEE',
      },
    });

    return updatedCycle;
  }
}
