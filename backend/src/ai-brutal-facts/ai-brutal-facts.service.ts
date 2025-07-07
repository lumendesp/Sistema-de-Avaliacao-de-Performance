import { Injectable } from '@nestjs/common';
import { GeminiService } from '../ai/ai.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BrutalFactsCache {
  insight: string;
  lastCycleId: number | null;
  lastUpdated: Date | null;
}

@Injectable()
export class AiBrutalFactsService {
  private cache: BrutalFactsCache = {
    insight: '',
    lastCycleId: null,
    lastUpdated: null,
  };

  constructor(private readonly geminiService: GeminiService) {}

  async getInsightForLastCompletedCycle(): Promise<string> {
    // Buscar o último ciclo concluído (CLOSED ou PUBLISHED)
    const lastCompletedCycle = await prisma.evaluationCycle.findFirst({
      where: { status: { in: ['CLOSED', 'PUBLISHED'] } },
      orderBy: { startDate: 'desc' }
    });
    if (!lastCompletedCycle) {
      return 'Nenhum ciclo concluído encontrado.';
    }
    if (this.cache.lastCycleId === lastCompletedCycle.id && this.cache.insight) {
      return this.cache.insight;
    }
    // Buscar colaboradores com notas finais do último ciclo concluído
    const collaborators = await prisma.user.findMany({
      where: {
        roles: { some: { role: 'COLLABORATOR' } },
        active: true,
        finalScores: { some: { cycleId: lastCompletedCycle.id } }
      },
      include: {
        position: true,
        finalScores: { where: { cycleId: lastCompletedCycle.id } },
        selfEvaluations: { where: { cycleId: lastCompletedCycle.id }, include: { items: true } },
        managerEvaluationsReceived: { where: { cycleId: lastCompletedCycle.id }, include: { items: true } },
        peerEvaluationsReceived: { where: { cycleId: lastCompletedCycle.id } }
      }
    });
    // Calcular médias por tipo de avaliação
    const autoScores: number[] = [];
    const managerScores: number[] = [];
    const peerScores: number[] = [];
    const finalScores: number[] = [];
    collaborators.forEach(collab => {
      if (collab.selfEvaluations.length > 0 && collab.selfEvaluations[0].items.length > 0) {
        const avgSelf = collab.selfEvaluations[0].items.reduce((sum, item) => sum + item.score, 0) / collab.selfEvaluations[0].items.length;
        autoScores.push(avgSelf);
      }
      if (collab.managerEvaluationsReceived.length > 0 && collab.managerEvaluationsReceived[0].items.length > 0) {
        const avgManager = collab.managerEvaluationsReceived[0].items.reduce((sum, item) => sum + item.score, 0) / collab.managerEvaluationsReceived[0].items.length;
        managerScores.push(avgManager);
      }
      if (collab.peerEvaluationsReceived.length > 0) {
        const avgPeer = collab.peerEvaluationsReceived.reduce((sum, peerEval) => sum + peerEval.score, 0) / collab.peerEvaluationsReceived.length;
        peerScores.push(avgPeer);
      }
      if (collab.finalScores.length > 0 && collab.finalScores[0].finalScore !== null) {
        finalScores.push(collab.finalScores[0].finalScore!);
      }
    });
    const averageAuto = autoScores.length > 0 ? (autoScores.reduce((sum, score) => sum + score, 0) / autoScores.length).toFixed(1) : '0.0';
    const averageManager = managerScores.length > 0 ? (managerScores.reduce((sum, score) => sum + score, 0) / managerScores.length).toFixed(1) : '0.0';
    const averagePeer = peerScores.length > 0 ? (peerScores.reduce((sum, score) => sum + score, 0) / peerScores.length).toFixed(1) : '0.0';
    const averageFinal = finalScores.length > 0 ? (finalScores.reduce((sum, score) => sum + score, 0) / finalScores.length).toFixed(1) : '0.0';
    const collaboratorsList = collaborators.map(collab => {
      let autoNota = '-';
      if (collab.selfEvaluations.length > 0 && collab.selfEvaluations[0].items.length > 0) {
        const avgSelf = collab.selfEvaluations[0].items.reduce((sum, item) => sum + item.score, 0) / collab.selfEvaluations[0].items.length;
        autoNota = avgSelf.toFixed(1);
      }
      let managerNota = '-';
      if (collab.managerEvaluationsReceived.length > 0 && collab.managerEvaluationsReceived[0].items.length > 0) {
        const avgManager = collab.managerEvaluationsReceived[0].items.reduce((sum, item) => sum + item.score, 0) / collab.managerEvaluationsReceived[0].items.length;
        managerNota = avgManager.toFixed(1);
      }
      let peerNota = '-';
      if (collab.peerEvaluationsReceived.length > 0) {
        const avgPeer = collab.peerEvaluationsReceived.reduce((sum, peerEval) => sum + peerEval.score, 0) / collab.peerEvaluationsReceived.length;
        peerNota = avgPeer.toFixed(1);
      }
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
    const topPerformers = collaboratorsList.filter(c => parseFloat(c.nota) >= 4.5).length;
    const totalEvaluated = collaboratorsList.length;
    const prompt = `Você é um analista de RH. Analise os dados de desempenho abaixo do ciclo "${lastCompletedCycle.name}" e gere um resumo e insights práticos para a equipe, sendo direto e sem enrolações, me dando apenas a resposta:\n\nNotas finais dos colaboradores: ${collaboratorsList.map(c => `${c.nome} (${c.cargo}): ${c.nota}`).join(', ')}\nMédia Autoavaliação: ${averageAuto}/5\nMédia Gestor: ${averageManager}/5\nMédia 360: ${averagePeer}/5\nMédia Final: ${averageFinal}/5\nTotal avaliados: ${totalEvaluated}\nTop performers (nota >= 4.5): ${topPerformers}\n\nSeja sucinto, objetivo e traga sugestões de melhoria.`;
    const insight = await this.geminiService.generate(prompt);
    this.cache = {
      insight,
      lastCycleId: lastCompletedCycle.id,
      lastUpdated: new Date(),
    };
    return insight;
  }
} 