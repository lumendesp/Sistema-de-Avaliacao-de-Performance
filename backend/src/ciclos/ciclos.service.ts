import { Injectable } from '@nestjs/common';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';
import { PrismaClient, Role } from '@prisma/client';
import { GeminiService } from '../ai/ai.service';
import { AiBrutalFactsService } from '../ai-brutal-facts/ai-brutal-facts.service';
import { CycleService } from './cycle.service';
import { CycleTransferService } from './cycle-transfer.service';

const prisma = new PrismaClient();

@Injectable()
export class CiclosService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly aiBrutalFactsService: AiBrutalFactsService,
    private readonly cycleService: CycleService,
    private readonly cycleTransferService: CycleTransferService,
  ) {}

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
    if (updateCicloDto.status === 'CLOSED' || updateCicloDto.status === 'PUBLISHED') {
      // Chama o método de geração de insight do serviço de Brutal Facts
      await this.aiBrutalFactsService.getInsightForLastCompletedCycle();
    }

    return updatedCycle;
  }

  async remove(id: number) {
    return prisma.evaluationCycle.delete({ where: { id } });
  }

  async getCurrentCycle(type?: Role) {

    
    // Buscar o ciclo mais recente do tipo especificado
    const currentCycle = await prisma.evaluationCycle.findFirst({
      where: {
        status: 'IN_PROGRESS',
        ...(type ? { type } : {})
      },
      orderBy: { startDate: 'desc' }
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
      type: (currentCycle as any).type,
      daysRemaining: Math.max(0, diffDays),
      isOverdue: diffDays < 0
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

    return notas.map(nota => {
      const selfEval = selfEvals.find(se => se.cycleId === nota.cycleId);
      let self = '-';
      if (selfEval && selfEval.items && selfEval.items.length > 0) {
        // Calcula a média dos scores dos items
        const scores = selfEval.items.map(item => item.score);
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        self = avg.toFixed(2);
      }
      return {
        cycle: nota.cycle.name,
        status: nota.cycle.status === 'IN_PROGRESS' ? 'Em andamento' : 'Finalizado',
        self,
        exec: nota.executionScore ?? '-',
        posture: nota.postureScore ?? '-',
        final: nota.finalScore ?? '-',
        summary: nota.summary ?? '-',
      };
    });
  }

  async getManagerDashboardStats(managerId: number) {
    // Buscar o ciclo atual usando o método existente com tipo MANAGER
    const currentCycle = await this.getCurrentCycle(Role.MANAGER);

    if (!currentCycle) {
      return {
        totalEvaluations: "0",
        evaluatedCollaborators: "0",
        pendingCollaborators: "0",
        averageScore: "0.0/5",
        evaluationTrend: "0% este mês",
        collaboratorTrend: "0% este mês",
        scoreTrend: "0.0 este mês",
        totalCollaborators: "0"
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
                  where: { cycleId: currentCycle.id }
                },
                selfEvaluations: {
                  where: { cycleId: currentCycle.id }
                },
                managerEvaluationsReceived: {
                  where: { cycleId: currentCycle.id }
                }
              }
            }
          }
        }
      }
    });

    if (!manager) {
      return {
        totalEvaluations: "0",
        evaluatedCollaborators: "0",
        pendingCollaborators: "0",
        averageScore: "0.0/5",
        evaluationTrend: "0% este mês",
        collaboratorTrend: "0% este mês",
        scoreTrend: "0.0 este mês",
        totalCollaborators: "0"
      };
    }

    // Lista de colaboradores do gestor, exceto ele mesmo e apenas ativos
    const collaborators = manager.manages
      .map(m => m.collaborator)
      .filter(c => c.id !== managerId && c.active);

    const totalCollaborators = collaborators.length;
    const totalEvaluations = totalCollaborators;
    const evaluatedCollaborators = collaborators.filter(collab => collab.finalScores.length > 0).length;
    const pendingCollaborators = totalCollaborators - evaluatedCollaborators;

    // Calcular média de desempenho - nota do ciclo atual
    const currentCycleScores = collaborators
      .filter(collab => collab.finalScores.length > 0)
      .map(collab => collab.finalScores[0].finalScore!)
      .filter(score => score !== null && score !== undefined);

    const averageScore = currentCycleScores.length > 0 
      ? (currentCycleScores.reduce((sum, score) => sum + score, 0) / currentCycleScores.length).toFixed(1)
      : '0.0';

    // Calcular tendências baseadas em dados reais (opcional: pode ser ajustado para comparar só entre colaboradores do gestor)
    // Buscar ciclo anterior para comparação
    const previousCycle = await prisma.evaluationCycle.findMany({
      orderBy: { startDate: 'desc' },
      skip: 1,
      take: 1
    });

    let evaluationTrend = "0% este mês";
    let collaboratorTrend = "0% este mês";
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
                    where: { cycleId: prevCycle.id }
                  }
                }
              }
            }
          }
        }
      });
      const prevCollaborators = prevManager ? prevManager.manages.map(m => m.collaborator).filter(c => c.id !== managerId && c.active) : [];
      const prevTotalCollaborators = prevCollaborators.length;
      const prevEvaluatedCollabs = prevCollaborators.filter(collab => collab.finalScores.length > 0).length;
      const prevScores = prevCollaborators
        .filter(collab => collab.finalScores.length > 0)
        .map(collab => collab.finalScores[0].finalScore!)
        .filter(score => score !== null && score !== undefined);
      const prevAverageScore = prevScores.length > 0 
        ? prevScores.reduce((sum, score) => sum + score, 0) / prevScores.length
        : 0;
      // Calcular tendências
      if (prevTotalCollaborators > 0) {
        const evalChange = ((totalEvaluations - prevTotalCollaborators) / prevTotalCollaborators * 100).toFixed(0);
        evaluationTrend = `${evalChange}% este mês`;
      }
      if (prevEvaluatedCollabs > 0) {
        const collabChange = ((evaluatedCollaborators - prevEvaluatedCollabs) / prevEvaluatedCollabs * 100).toFixed(0);
        collaboratorTrend = `${collabChange}% este mês`;
      }
      if (prevAverageScore > 0) {
        const scoreChange = (parseFloat(averageScore) - prevAverageScore).toFixed(1);
        scoreTrend = `${scoreChange} este mês`;
      }
    } else {
      evaluationTrend = "+12% este mês";
      collaboratorTrend = "+5% este mês";
      scoreTrend = "+0.3 este mês";
    }

    return {
      totalEvaluations: totalEvaluations.toString(),
      evaluatedCollaborators: evaluatedCollaborators.toString(),
      pendingCollaborators: pendingCollaborators.toString(),
      averageScore: `${averageScore}/5`,
      evaluationTrend,
      collaboratorTrend,
      scoreTrend,
      totalCollaborators: totalCollaborators.toString()
    };
  }

  async getBrutalFactsData() {
    // Buscar dados já processados do serviço de Brutal Facts
    const brutalFactsData = await this.aiBrutalFactsService.getBrutalFactsDataForLastCompletedCycle();
    if (!brutalFactsData) {
      return {
        insights: "Nenhum ciclo concluído encontrado.",
        chartData: [],
        collaborators: []
      };
    }

    // Buscar histórico de ciclos concluídos para o gráfico
    const completedCycles = await prisma.evaluationCycle.findMany({
      where: {
        status: {
          in: ['CLOSED', 'PUBLISHED']
        },
        type: 'HR'
      },
      orderBy: { startDate: 'desc' },
      take: 5
    });

    const chartData = await Promise.all(completedCycles.map(async (cycle) => {
      const scores = await prisma.finalScore.findMany({
        where: { 
          cycleId: cycle.id,
          finalScore: { not: null }
        },
        select: { finalScore: true }
      });

      const averageScore = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score.finalScore!, 0) / scores.length
        : 0;

      return {
        ciclo: cycle.name,
        valor: parseFloat(averageScore.toFixed(1))
      };
    }));

    // Calcular aumento em relação ao ciclo anterior (scoreTrend)
    let scoreTrend: string | undefined = undefined;
    const lastCycleName = brutalFactsData.cycleName;
    const previousCycle = await prisma.evaluationCycle.findMany({
      where: {
        status: {
          in: ['CLOSED', 'PUBLISHED']
        },
        name: { not: lastCycleName }
      },
      orderBy: { startDate: 'desc' },
      take: 1
    });
    if (previousCycle.length > 0) {
      const prevCycle = previousCycle[0];
      // Buscar notas finais do ciclo anterior
      const prevScores = await prisma.finalScore.findMany({
        where: {
          cycleId: prevCycle.id,
          finalScore: { not: null }
        },
        select: { finalScore: true }
      });
      const prevAverageFinal = prevScores.length > 0
        ? prevScores.reduce((sum, score) => sum + score.finalScore!, 0) / prevScores.length
        : 0;
      scoreTrend = (parseFloat(brutalFactsData.averageFinal) - prevAverageFinal).toFixed(1).toString() + ' este ciclo';
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
      scoreTrend
    };
  }

  async getDebugCycles() {
    const allCycles = await prisma.evaluationCycle.findMany({
      orderBy: { startDate: 'desc' }
    });
    
    return allCycles.map(cycle => ({
      id: cycle.id,
      name: cycle.name,
      type: (cycle as any).type,
      status: cycle.status,
      startDate: cycle.startDate,
      endDate: cycle.endDate
    }));
  }

  /**
   * Fecha o ciclo de colaborador, cria o ciclo de gestor e transfere os dados.
   */
  async closeCollaboratorAndCreateManagerCycle(collabCycleId?: number) {
    let cycleId = collabCycleId;
    if (!cycleId) {
      const mostRecent = await this.cycleService.getMostRecentCycle('COLLABORATOR', 'IN_PROGRESS');
      if (!mostRecent) throw new Error('Nenhum ciclo de colaborador em andamento encontrado');
      cycleId = mostRecent.id;
    }
    if (!cycleId || typeof cycleId !== 'number' || isNaN(cycleId)) {
      throw new Error('collabCycleId inválido ou não fornecido');
    }
    // 1. Fechar o ciclo de colaborador
    await this.cycleService.closeCycle(cycleId);

    // 2. Buscar dados do ciclo de colaborador
    const collabCycle = await this.cycleService.getMostRecentCycle('COLLABORATOR', 'CLOSED');

    // 3. Criar ciclo de gestor (manager)
    const managerCycle = await this.cycleService.createCycle({
      name: collabCycle?.name || 'Novo ciclo gestor',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      type: 'MANAGER',
    });

    // 4. Transferir dados
    await this.cycleTransferService.transferCycleData(cycleId, managerCycle.id);

    return { message: 'Ciclo de colaborador fechado, ciclo de gestor criado e dados transferidos!', managerCycleId: managerCycle.id };
  }

  /**
   * Fecha o ciclo de gestor, cria o ciclo de RH e transfere os dados.
   */
  async closeManagerAndCreateRhCycle(managerCycleId?: number) {
    let cycleId = managerCycleId;
    if (!cycleId) {
      const mostRecent = await this.cycleService.getMostRecentCycle('MANAGER', 'IN_PROGRESS');
      if (!mostRecent) throw new Error('Nenhum ciclo de gestor em andamento encontrado');
      cycleId = mostRecent.id;
    }
    if (!cycleId || typeof cycleId !== 'number' || isNaN(cycleId)) {
      throw new Error('managerCycleId inválido ou não fornecido');
    }
    // 1. Fechar o ciclo de gestor
    await this.cycleService.closeCycle(cycleId);

    // 2. Buscar dados do ciclo de gestor
    const managerCycle = await this.cycleService.getMostRecentCycle('MANAGER', 'CLOSED');

    // 3. Criar ciclo de RH
    const rhCycle = await this.cycleService.createCycle({
      name: managerCycle?.name || 'Novo ciclo RH',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      type: 'HR',
    });

    // 4. Transferir dados
    await this.cycleTransferService.transferCycleData(cycleId, rhCycle.id);

    return { message: 'Ciclo de gestor fechado, ciclo de RH criado e dados transferidos!', rhCycleId: rhCycle.id };
  }
}
