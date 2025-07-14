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
import * as crypto from 'crypto';

const ENCRYPTION_KEY =
  process.env.EVAL_ENCRYPT_KEY?.padEnd(32, '0').slice(0, 32) ||
  '12345678901234567890123456789012';

function decrypt(text: string): string {
  if (!text || typeof text !== 'string') return '';

  try {
    const [ivStr, encrypted] = text.split(':');
    if (!ivStr || !encrypted) return '';

    const iv = Buffer.from(ivStr, 'base64');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY),
      iv,
    );
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.warn('Falha ao descriptografar:', error.message);
    return '[ERRO DE DESCRIPTOGRAFIA]';
  }
}

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

  async getSummary(userId: number, cycleId: number): Promise<string | null> {
    const summary = await this.prisma.aISummary.findUnique({
      where: { userId_cycleId: { userId, cycleId } },
    });

    return summary?.text || null;
  }

  async getAllSummariesByCycle(cycleId: number) {
    return this.prisma.aISummary.findMany({
      where: { cycleId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true, 
          },
        },
      },
    });
  }

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
    let prompt = `Você é um sistema de RH. Abaixo estão avaliações de desempenho de um colaborador. Analise e gere um resumo objetivo (máximo 5 linhas), focando apenas nos principais pontos fortes, pontos de desenvolvimento e recomendações mais relevantes.\n Sua resposta deve ser apenas o resumo, sem introduções como "Com base nas avaliações..." ou "Resumo:".\n\n`;

    if (self.length) {
      prompt += `Autoavaliação:\n`;
      for (const ev of self) {
        for (const item of ev.items) {
          prompt += `- Critério: ${item.criterionId}, Justificativa: ${decrypt(item.justification)}, Nota: ${item.score}\n`;
        }
      }
    }

    if (peer.length) {
      prompt += `\nAvaliações por Pares:\n`;
      for (const p of peer) {
        prompt += `- Pontos fortes: ${decrypt(p.strengths)}, Melhorias: ${decrypt(p.improvements)}, Nota: ${p.score}\n`;
      }
    }

    if (mentor.length) {
      prompt += `\nAvaliação do mentor:\n`;
      for (const m of mentor) {
        for (const item of m.items) {
          prompt += `- Critério: ${item.criterionId}, Justificativa: ${decrypt(item.justification)}, Nota: ${item.score}\n`;
        }
      }
    }

    if (manager.length) {
      prompt += `\nAvaliação do gestor:\n`;
      for (const m of manager) {
        for (const item of m.items) {
          prompt += `- Critério: ${item.criterionId}, Justificativa: ${decrypt(item.justification)}, Nota: ${item.score}\n`;
        }
      }
    }

    if (references.length) {
      prompt += `\nReferências recebidas:\n`;
      for (const r of references) {
        prompt += `- ${decrypt(r.justification)}\n`;
      }
    }

    return prompt;
  }
}
