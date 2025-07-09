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

  async getLastSubmittedAt(
    userId: number,
    cycleId: number,
  ): Promise<string | null> {
    const self = await this.prisma.selfEvaluation.findFirst({
      where: { userId, cycleId, submittedAt: { not: null } },
      orderBy: { submittedAt: 'desc' },
      select: { submittedAt: true },
    });

    const peer = await this.prisma.peerEvaluation.findFirst({
      where: { evaluatorId: userId, cycleId, submittedAt: { not: null } },
      orderBy: { submittedAt: 'desc' },
      select: { submittedAt: true },
    });

    const mentor = await this.prisma.mentorEvaluation.findFirst({
      where: { evaluatorId: userId, cycleId, submittedAt: { not: null } },
      orderBy: { submittedAt: 'desc' },
      select: { submittedAt: true },
    });

    const reference = await this.prisma.reference.findFirst({
      where: { providerId: userId, cycleId, submittedAt: { not: null } },
      orderBy: { submittedAt: 'desc' },
      select: { submittedAt: true },
    });

    const dates = [
      self?.submittedAt,
      peer?.submittedAt,
      mentor?.submittedAt,
      reference?.submittedAt,
    ]
      .filter(Boolean)
      .map((d) => new Date(d!));

    if (dates.length === 0) return null;

    const latest = dates.sort((a, b) => b.getTime() - a.getTime())[0];

    return latest.toISOString();
  }

  async submitEvaluation(userId: number, cycleId: number) {
    // Verifica se todas as avaliações estão completas
    const completionStatus = await this.getCompletionStatus(userId, cycleId);

    if (!Object.values(completionStatus).every(Boolean)) {
      throw new Error(
        'Todas as avaliações devem estar completas antes do envio',
      );
    }

    // Envia cada tipo de avaliação separadamente
    await this.submitSelfEvaluation(userId, cycleId);
    await this.submitPeerEvaluation(userId, cycleId);
    await this.submitMentorEvaluation(userId, cycleId);
    await this.submitReferenceEvaluation(userId, cycleId);

    // Retorna timestamp do envio
    return { submittedAt: new Date().toISOString() };
  }

  // ----------- SELF -----------
  private async submitSelfEvaluation(userId: number, cycleId: number) {
    await this.prisma.selfEvaluation.updateMany({
      where: {
        userId,
        cycleId,
      },
      data: {
        submittedAt: new Date(),
      },
    });

    console.log(
      `Autoavaliação enviada para usuário ${userId} no ciclo ${cycleId}`,
    );
  }

  // ----------- PEER -----------
  private async submitPeerEvaluation(userId: number, cycleId: number) {
    await this.prisma.peerEvaluation.updateMany({
      where: {
        evaluatorId: userId,
        cycleId,
      },
      data: {
        submittedAt: new Date(),
      },
    });

    console.log(
      `Avaliações de pares enviadas para usuário ${userId} no ciclo ${cycleId}`,
    );
  }

  // ----------- MENTOR -----------
  private async submitMentorEvaluation(userId: number, cycleId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { mentorId: true },
    });

    if (user?.mentorId) {
      await this.prisma.mentorEvaluation.updateMany({
        where: {
          evaluatorId: userId,
          evaluateeId: user.mentorId,
          cycleId,
        },
        data: {
          submittedAt: new Date(),
        },
      });

      console.log(
        `Avaliação do mentor enviada para usuário ${userId} no ciclo ${cycleId}`,
      );
    }
  }

  // ----------- REFERENCE -----------
  private async submitReferenceEvaluation(userId: number, cycleId: number) {
    await this.prisma.reference.updateMany({
      where: {
        providerId: userId,
        cycleId,
      },
      data: {
        submittedAt: new Date(),
      },
    });

    console.log(
      `Referências enviadas para usuário ${userId} no ciclo ${cycleId}`,
    );
  }
}
