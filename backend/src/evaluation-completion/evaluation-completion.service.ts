import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class EvaluationCompletionService {
  constructor(private prisma: PrismaService) {}

  async getCompletionStatus(userId: number, cycleId: number) {
    const [peerEvaluations, references, selfEvaluations, user] =
      await Promise.all([
        this.prisma.peerEvaluation.findMany({
          where: { evaluatorId: userId, cycleId },
          include: { projects: { include: { project: true } } },
        }),
        this.prisma.reference.findMany({
          where: { providerId: userId, cycleId },
        }),

        this.prisma.selfEvaluation.findMany({
          where: { userId: userId, cycleId },
          include: { items: true },
        }),
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { mentorId: true },
        }),
      ]);

    // ---- SELF
    const isSelfComplete =
      !!selfEvaluations.length && // garante que tenha ao menos 1
      selfEvaluations.every((selfEval) =>
        selfEval.items.every(
          (item) =>
            item.score > 0 &&
            item.justification &&
            item.justification.trim().length > 0,
        ),
      );

    // ---- PEER
    const isPeerComplete =
      peerEvaluations.length > 0 && // deve ter pelo menos uma avaliação
      peerEvaluations.every(
        (evaluation) =>
          !!evaluation.score &&
          !!evaluation.strengths?.trim() &&
          !!evaluation.improvements?.trim() &&
          !!evaluation.motivation &&
          evaluation.projects?.length > 0 &&
          !!evaluation.projects[0]?.project?.name?.trim() &&
          !!evaluation.projects[0]?.period,
      );

    // ---- REFERENCE
    const isReferenceComplete =
      references.length === 0 || // se não tiver nenhuma referência, tá completo
      references.every((ref) => !!ref.justification?.trim());

    // ---- MENTOR
    let isMentorComplete = true;

    if (user && user.mentorId) {
      const mentorEvaluation = await this.prisma.mentorEvaluation.findFirst({
        where: {
          evaluatorId: userId,
          evaluateeId: user.mentorId,
          cycleId,
        },
      });

      isMentorComplete =
        !!mentorEvaluation?.score && !!mentorEvaluation?.justification?.trim();
    }

    return {
      self: isSelfComplete,
      peer: isPeerComplete,
      mentor: isMentorComplete,
      reference: isReferenceComplete,
    };
  }

  async submitEvaluation(userId: number, cycleId: number) {
    const completionStatus = await this.getCompletionStatus(userId, cycleId);

    if (!Object.values(completionStatus).every(Boolean)) {
      throw new Error(
        'Todas as avaliações devem estar completas antes do envio',
      );
    }

    // Marca ciclo como enviado para o usuário
    await this.prisma.evaluationCycleUser.upsert({
      where: { userId_cycleId: { userId, cycleId } },
      update: {
        submittedAt: new Date(),
        isSubmit: true,
      },
      create: {
        userId,
        cycleId,
        submittedAt: new Date(),
        isSubmit: true,
      },
    });

    console.log(`Avaliações enviadas para o ciclo ${cycleId} por ${userId}`);

    return { submittedAt: new Date().toISOString() };
  }

  async unlockEvaluation(userId: number, cycleId: number) {
    await this.prisma.evaluationCycleUser.upsert({
      where: { userId_cycleId: { userId, cycleId } },
      update: {
        submittedAt: null,
        isSubmit: false,
      },
      create: {
        userId,
        cycleId,
        submittedAt: null,
        isSubmit: false,
      },
    });

    console.log(
      `Avaliações desbloqueadas para o ciclo ${cycleId} por ${userId}`,
    );

    return { message: 'Avaliações desbloqueadas com sucesso' };
  }

  async getCycleSubmissionInfo(userId: number, cycleId: number) {
    const cycleUser = await this.prisma.evaluationCycleUser.findUnique({
      where: { userId_cycleId: { userId, cycleId } },
      select: {
        submittedAt: true,
        isSubmit: true,
      },
    });

    return cycleUser;
  }
}
