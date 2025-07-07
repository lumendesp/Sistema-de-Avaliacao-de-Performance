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
    const isPeerComplete = peerEvaluations.every(
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
}
