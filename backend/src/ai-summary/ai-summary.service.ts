import { Injectable } from '@nestjs/common';
import { CreateSummaryDto } from './dto/create-summary.dto';
import {
  SelfEvaluation,
  PeerEvaluation,
  MentorEvaluation,
  ManagerEvaluation,
  Reference,
} from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { GeminiService } from 'src/ai/ai.service';

type SelfWithItems = {
  items: {
    criterionId: number;
    justification: string;
    score: number;
  }[];
};

type MentorWithItems = {
  items: {
    criterionId: number;
    justification: string;
    score: number;
  }[];
};

type ManagerWithItems = {
  items: {
    criterionId: number;
    justification: string;
    score: number;
  }[];
};

@Injectable()
export class AiSummaryService {
  constructor(
    private prisma: PrismaService,
    private geminiService: GeminiService,
  ) {}

  async generateSummary({
    userId,
    cycleId,
  }: CreateSummaryDto): Promise<string> {
    const self = await this.prisma.selfEvaluation.findMany({
      where: { userId, cycleId },
      include: { items: true },
    });

    const peer = await this.prisma.peerEvaluation.findMany({
      where: { evaluateeId: userId, cycleId },
    });

    const mentor = await this.prisma.mentorEvaluation.findMany({
      where: { evaluateeId: userId, cycleId },
      include: { items: true },
    });

    const manager = await this.prisma.managerEvaluation.findMany({
      where: { evaluateeId: userId, cycleId },
      include: { items: true },
    });

    const references = await this.prisma.reference.findMany({
      where: { receiverId: userId, cycleId },
    });

    const prompt = this.buildPrompt(self, peer, mentor, manager, references);

    const response = await this.geminiService.generate(prompt);

    await this.prisma.aISummary.upsert({
      where: { userId_cycleId: { userId, cycleId } },
      update: { text: response },
      create: { userId, cycleId, text: response },
    });

    return response;
  }

  private buildPrompt(
    self: (SelfEvaluation & SelfWithItems)[],
    peer: PeerEvaluation[],
    mentor: (MentorEvaluation & MentorWithItems)[],
    manager: (ManagerEvaluation & ManagerWithItems)[],
    references: Reference[],
  ): string {
    let prompt = `Você é um sistema de RH. Com base nas avaliações a seguir, gere um resumo profissional do desempenho do colaborador durante o ciclo.\n\n`;

    if (self.length) {
      prompt += `Autoavaliação:\n`;
      for (const ev of self) {
        for (const item of ev.items) {
          prompt += `- Critério: ${item.criterionId}, Justificativa: ${item.justification}, Nota: ${item.score}\n`;
        }
      }
    }

    if (peer.length) {
      prompt += `\nAvaliações por Pares:\n`;
      for (const p of peer) {
        prompt += `- Pontos fortes: ${p.strengths}, Melhorias: ${p.improvements}, Nota: ${p.score}\n`;
      }
    }

    if (mentor.length) {
      prompt += `\nAvaliação do mentor:\n`;
      for (const m of mentor) {
        for (const item of m.items) {
          prompt += `- Critério: ${item.criterionId}, Justificativa: ${item.justification}, Nota: ${item.score}\n`;
        }
      }
    }

    if (manager.length) {
      prompt += `\nAvaliação do gestor:\n`;
      for (const m of manager) {
        for (const item of m.items) {
          prompt += `- Critério: ${item.criterionId}, Justificativa: ${item.justification}, Nota: ${item.score}\n`;
        }
      }
    }

    if (references.length) {
      prompt += `\nReferências recebidas:\n`;
      for (const r of references) {
        prompt += `- ${r.justification}\n`;
      }
    }

    return prompt;
  }
}
