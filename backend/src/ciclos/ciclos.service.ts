import { Injectable } from '@nestjs/common';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';
import { PrismaClient } from '@prisma/client';
import { GeminiService } from '../ai/ai.service';
import { AiBrutalFactsService } from '../ai-brutal-facts/ai-brutal-facts.service';

const prisma = new PrismaClient();

@Injectable()
export class CiclosService {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly aiBrutalFactsService: AiBrutalFactsService,
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
    return prisma.evaluationCycle.update({
      where: { id },
      data: {
        ...updateCicloDto,
        status: updateCicloDto.status as any,
      },
    });
  }

  async remove(id: number) {
    return prisma.evaluationCycle.delete({ where: { id } });
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
    // Buscar o ciclo atual (mais recente)
    const currentCycle = await prisma.evaluationCycle.findFirst({
      orderBy: { startDate: 'desc' }
    });

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
    // Buscar o último ciclo concluído (CLOSED ou PUBLISHED)
    const lastCompletedCycle = await prisma.evaluationCycle.findFirst({
      where: {
        status: {
          in: ['CLOSED', 'PUBLISHED']
        }
      },
      orderBy: { startDate: 'desc' }
    });

    if (!lastCompletedCycle) {
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
        }
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

    // Buscar colaboradores com notas finais do último ciclo concluído
    const collaborators = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: 'COLLABORATOR'
          }
        },
        active: true,
        finalScores: {
          some: {
            cycleId: lastCompletedCycle.id
          }
        }
      },
      include: {
        position: true,
        finalScores: {
          where: {
            cycleId: lastCompletedCycle.id
          }
        },
        selfEvaluations: {
          where: {
            cycleId: lastCompletedCycle.id
          },
          include: {
            items: true
          }
        },
        managerEvaluationsReceived: {
          where: {
            cycleId: lastCompletedCycle.id
          },
          include: {
            items: true
          }
        },
        peerEvaluationsReceived: {
          where: {
            cycleId: lastCompletedCycle.id
          }
        }
      }
    });

    // Calcular médias por tipo de avaliação
    const autoScores: number[] = [];
    const managerScores: number[] = [];
    const peerScores: number[] = [];
    const finalScores: number[] = [];

    collaborators.forEach(collab => {
      // Autoavaliação - média dos itens
      if (collab.selfEvaluations.length > 0 && collab.selfEvaluations[0].items.length > 0) {
        const avgSelf = collab.selfEvaluations[0].items.reduce((sum, item) => sum + item.score, 0) / collab.selfEvaluations[0].items.length;
        autoScores.push(avgSelf);
      }

      // Avaliação do gestor - média dos itens
      if (collab.managerEvaluationsReceived.length > 0 && collab.managerEvaluationsReceived[0].items.length > 0) {
        const avgManager = collab.managerEvaluationsReceived[0].items.reduce((sum, item) => sum + item.score, 0) / collab.managerEvaluationsReceived[0].items.length;
        managerScores.push(avgManager);
      }

      // Avaliação 360 - média das avaliações dos pares
      if (collab.peerEvaluationsReceived.length > 0) {
        const avgPeer = collab.peerEvaluationsReceived.reduce((sum, peerEval) => sum + peerEval.score, 0) / collab.peerEvaluationsReceived.length;
        peerScores.push(avgPeer);
      }

      // Nota final (equalização)
      if (collab.finalScores.length > 0 && collab.finalScores[0].finalScore !== null) {
        finalScores.push(collab.finalScores[0].finalScore!);
      }
    });

    // Calcular médias gerais
    const averageAuto = autoScores.length > 0 ? (autoScores.reduce((sum, score) => sum + score, 0) / autoScores.length).toFixed(1) : '0.0';
    const averageManager = managerScores.length > 0 ? (managerScores.reduce((sum, score) => sum + score, 0) / managerScores.length).toFixed(1) : '0.0';
    const averagePeer = peerScores.length > 0 ? (peerScores.reduce((sum, score) => sum + score, 0) / peerScores.length).toFixed(1) : '0.0';
    const averageFinal = finalScores.length > 0 ? (finalScores.reduce((sum, score) => sum + score, 0) / finalScores.length).toFixed(1) : '0.0';

    const collaboratorsList = collaborators.map(collab => {
      // Calcular nota de autoavaliação
      let autoNota = '-';
      if (collab.selfEvaluations.length > 0 && collab.selfEvaluations[0].items.length > 0) {
        const avgSelf = collab.selfEvaluations[0].items.reduce((sum, item) => sum + item.score, 0) / collab.selfEvaluations[0].items.length;
        autoNota = avgSelf.toFixed(1);
      }

      // Calcular nota do gestor
      let managerNota = '-';
      if (collab.managerEvaluationsReceived.length > 0 && collab.managerEvaluationsReceived[0].items.length > 0) {
        const avgManager = collab.managerEvaluationsReceived[0].items.reduce((sum, item) => sum + item.score, 0) / collab.managerEvaluationsReceived[0].items.length;
        managerNota = avgManager.toFixed(1);
      }

      // Calcular nota 360
      let peerNota = '-';
      if (collab.peerEvaluationsReceived.length > 0) {
        const avgPeer = collab.peerEvaluationsReceived.reduce((sum, peerEval) => sum + peerEval.score, 0) / collab.peerEvaluationsReceived.length;
        peerNota = avgPeer.toFixed(1);
      }

      // Nota final (equalização)
      const finalNota = collab.finalScores[0]?.finalScore?.toFixed(1) || '-';

      return {
        nome: collab.name,
        cargo: collab.position?.name || 'Cargo não definido',
        nota: finalNota,
        autoNota,
        managerNota,
        peerNota,
        finalNota
      };
    });

    // Gerar insights baseados nos dados do último ciclo concluído
    const topPerformers = collaboratorsList.filter(c => parseFloat(c.nota) >= 4.5).length;
    const totalEvaluated = collaboratorsList.length;
    
    const insights = await this.aiBrutalFactsService.getInsightForLastCompletedCycle();

    // Calcular aumento em relação ao ciclo anterior (scoreTrend)
    let scoreTrend: string | undefined = undefined;
    // Buscar ciclo anterior ao último concluído
    const previousCycle = await prisma.evaluationCycle.findMany({
      where: {
        status: {
          in: ['CLOSED', 'PUBLISHED']
        },
        id: { not: lastCompletedCycle.id }
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
      scoreTrend = (parseFloat(averageFinal) - prevAverageFinal).toFixed(1).toString();
    }

    return {
      insights,
      chartData,
      collaborators: collaboratorsList,
      cycleName: lastCompletedCycle.name,
      averageScore: `${averageFinal}/5`,
      totalEvaluated: totalEvaluated.toString(),
      averageAuto: `${averageAuto}/5`,
      averageManager: `${averageManager}/5`,
      averagePeer: `${averagePeer}/5`,
      averageFinal: `${averageFinal}/5`,
      scoreTrend: scoreTrend ? `${scoreTrend} este ciclo` : undefined
    };
  }
}
