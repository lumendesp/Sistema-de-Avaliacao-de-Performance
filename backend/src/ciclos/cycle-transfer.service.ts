import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class CycleTransferService {
  /**
   * Copia todos os dados de avaliações de um ciclo para outro (self, peer, manager, finalScore)
   */
  async transferCycleData(fromCycleId: number, toCycleId: number) {
    // 1. Self Evaluations
    const selfEvals = await prisma.selfEvaluation.findMany({
      where: { cycleId: fromCycleId },
      include: { items: true }
    });
    for (const evaluation of selfEvals) {
      await prisma.selfEvaluation.create({
        data: {
          userId: evaluation.userId,
          cycleId: toCycleId,
          averageScore: evaluation.averageScore,
          items: {
            create: evaluation.items.map(item => ({
              criterionId: item.criterionId,
              score: item.score,
              justification: item.justification,
              scoreDescription: item.scoreDescription,
            }))
          }
        }
      });
    }

    // 2. Peer Evaluations
    const peerEvals = await prisma.peerEvaluation.findMany({
      where: { cycleId: fromCycleId },
      include: { projects: true }
    });
    for (const evaluation of peerEvals) {
      await prisma.peerEvaluation.create({
        data: {
          evaluatorId: evaluation.evaluatorId,
          evaluateeId: evaluation.evaluateeId,
          cycleId: toCycleId,
          score: evaluation.score,
          strengths: evaluation.strengths,
          improvements: evaluation.improvements,
          motivation: evaluation.motivation,
          projects: {
            create: evaluation.projects.map(p => ({
              projectId: p.projectId,
              period: p.period
            }))
          }
        }
      });
    }

    // 3. Manager Evaluations
    const managerEvals = await prisma.managerEvaluation.findMany({
      where: { cycleId: fromCycleId },
      include: { items: true }
    });
    for (const evaluation of managerEvals) {
      await prisma.managerEvaluation.create({
        data: {
          evaluatorId: evaluation.evaluatorId,
          evaluateeId: evaluation.evaluateeId,
          cycleId: toCycleId,
          status: evaluation.status,
          items: {
            create: evaluation.items.map(item => ({
              criterionId: item.criterionId,
              score: item.score,
              justification: item.justification,
              scoreDescription: item.scoreDescription,
              groupId: item.groupId,
            }))
          }
        }
      });
    }

    // 4. Final Scores
    const finalScores = await prisma.finalScore.findMany({
      where: { cycleId: fromCycleId }
    });
    for (const score of finalScores) {
      await prisma.finalScore.create({
        data: {
          userId: score.userId,
          cycleId: toCycleId,
          executionScore: score.executionScore,
          postureScore: score.postureScore,
          finalScore: score.finalScore,
          summary: score.summary,
          adjustedBy: score.adjustedBy,
          justification: score.justification,
        }
      });
    }
    return { message: 'Transferência concluída!' };
  }
} 