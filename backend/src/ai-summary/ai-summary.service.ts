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
    return '[ERRO DE DESCRIPTOGRAFIA]';
  }
}

type SelfWithItems = {
  items: { criterionId: number; justification: string; score: number }[];
};

type MentorWithItems = {
  items: { criterionId: number; justification: string; score: number }[];
};

type ManagerWithItems = {
  items: { criterionId: number; justification: string; score: number }[];
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

  async getLeanSummary(userId: number, cycleId: number): Promise<string | null> {
    const summary = await this.prisma.aISummary.findUnique({
      where: { userId_cycleId: { userId, cycleId } },
    });
    return summary?.leanText || null;
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

  async generateLeanSummary({
    userId,
    cycleId,
  }: CreateSummaryDto): Promise<string> {
    const summary = await this.getSummary(userId, cycleId);
    if (!summary) throw new Error('Resumo técnico ainda não gerado');

    const prompt = `Reescreva o texto abaixo como uma mensagem final para o colaborador, com no máximo 2 frases. Seja direto e destaque apenas os principais pontos positivos, como: "Você se destacou em X e Y". Não use sugestões, perguntas nem linguagem técnica.

${summary}

Mensagem final:`;

    const leanText = await this.geminiService.generate(prompt);

    await this.prisma.aISummary.upsert({
      where: { userId_cycleId: { userId, cycleId } },
      update: { leanText },
      create: { userId, cycleId, text: '', leanText },
    });

    return leanText;
  }

  private buildPrompt(
    self: (SelfEvaluation & SelfWithItems)[],
    peer: PeerEvaluation[],
    mentor: (MentorEvaluation & MentorWithItems)[],
    manager: (ManagerEvaluation & ManagerWithItems)[],
    references: Reference[],
  ): string {
    let prompt = `
Você é um analista de RH e recebeu diversas avaliações sobre o desempenho de um colaborador. Seu objetivo é gerar um parágrafo único, objetivo e impessoal (no máximo 5 linhas), que destaque:

- Os principais pontos fortes observados.
- Os principais pontos de melhoria identificados.
- Sugestões práticas de desenvolvimento.

Formato da resposta:
- Um único parágrafo, sem listas e sem tópicos.
- Não inclua frases como "Com base nas avaliações..." ou "Resumo:".
- Use uma linguagem clara e profissional.

Abaixo estão dois exemplos de entrada e saída. Depois deles, virão os dados reais a serem analisados.

[Autoavaliação]
Justificativa: Conduzi reuniões semanais para acompanhar o progresso do time. Nota: 4
Justificativa: Planejei entregas com antecedência e reduzi retrabalho. Nota: 5
Justificativa: Preciso melhorar a forma como dou feedback. Nota: 3

[Avaliações por Pares]
Pontos fortes: Sempre disponível para ajudar e compartilha conhecimento. Pontos de melhoria: Às vezes atropela as ideias do grupo. Nota: 4
Pontos fortes: Boa capacidade de organização e foco em resultado. Pontos de melhoria: Pode trabalhar mais a escuta ativa. Nota: 3
Pontos fortes: Demonstra liderança e domínio técnico. Pontos de melhoria: Precisa envolver mais o time em decisões. Nota: 4

[Avaliação do gestor]
Justificativa: Tem visão estratégica e entrega com consistência. Pode melhorar a comunicação com a equipe. Nota: 4

[Resumo gerado]
O colaborador apresenta forte capacidade de organização, liderança e proatividade, destacando-se pela consistência nas entregas e domínio técnico. É frequentemente reconhecido pela disponibilidade para apoiar colegas e pelo foco em resultados. No entanto, algumas avaliações indicam oportunidades de desenvolvimento em escuta ativa e no engajamento da equipe em processos decisórios. Recomenda-se o fortalecimento de habilidades de comunicação empática e práticas de feedback construtivo para ampliar sua influência no time.

[Autoavaliação]
Justificativa: Assumi o planejamento técnico de dois projetos. Nota: 5
Justificativa: Fui mentor de um novo integrante da equipe. Nota: 4
Justificativa: Preciso lidar melhor com prazos curtos. Nota: 3

[Avaliações por Pares]
Pontos fortes: Inspira confiança e apoia a equipe. Pontos de melhoria: Pode ser mais aberto a sugestões. Nota: 4
Pontos fortes: Boa comunicação e senso de dono. Pontos de melhoria: Às vezes assume demais para si. Nota: 4

[Avaliação do mentor]
Justificativa: Demonstra maturidade e foco no crescimento da equipe. Pode delegar mais. Nota: 4

[Referência]
Justificativa: Excelente parceiro de trabalho, sempre disposto a colaborar.

[Resumo gerado]
Reconhecido por sua postura colaborativa, comunicação clara e senso de liderança, o colaborador também se destacou como mentor técnico no período avaliado. Demonstrou iniciativa ao assumir planejamentos e apoiar colegas, contribuindo diretamente para o desenvolvimento da equipe. Como oportunidades de crescimento, foram mencionadas a necessidade de lidar melhor com situações sob pressão e delegar responsabilidades de forma mais equilibrada. Recomenda-se investir em práticas de gestão de tempo e abertura a contribuições externas.

--- DADOS REAIS ABAIXO ---

`;

    if (self.length) {
      prompt += `\n[Autoavaliação]\n`;
      for (const ev of self) {
        for (const item of ev.items) {
          prompt += `Justificativa: ${decrypt(item.justification)}. Nota: ${item.score}\n`;
        }
      }
    }

    if (peer.length) {
      prompt += `\n[Avaliações por Pares]\n`;
      for (const p of peer) {
        prompt += `Pontos fortes: ${decrypt(p.strengths)}. Pontos de melhoria: ${decrypt(p.improvements)}. Nota: ${p.score}\n`;
      }
    }

    if (mentor.length) {
      prompt += `\n[Avaliação do mentor]\n`;
      for (const m of mentor) {
        for (const item of m.items) {
          prompt += `Justificativa: ${decrypt(item.justification)}. Nota: ${item.score}\n`;
        }
      }
    }

    if (manager.length) {
      prompt += `\n[Avaliação do gestor]\n`;
      for (const m of manager) {
        for (const item of m.items) {
          prompt += `Justificativa: ${decrypt(item.justification)}. Nota: ${item.score}\n`;
        }
      }
    }

    if (references.length) {
      prompt += `\n[Referências recebidas]\n`;
      for (const r of references) {
        prompt += `Justificativa: ${decrypt(r.justification)}\n`;
      }
    }

    return prompt;
  }
}
