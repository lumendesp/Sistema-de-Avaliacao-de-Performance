import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { GeminiService } from 'src/ai/ai.service';
import { CreateClimateSummaryDto } from './dto/create-climate-summary.dto';

@Injectable()
export class AiClimateSummaryService {
  constructor(
    private prisma: PrismaService,
    public geminiService: GeminiService,
  ) {}

  async getSummary(surveyId: number): Promise<{
    text: string | null;
    shortText: string | null;
    satisfactionScore: number | null;
    status: string;
  }> {
    const summary = await this.prisma.climateSurveyAISummary.findUnique({
      where: { surveyId },
    });

    return {
      text: summary?.text || null,
      shortText: summary?.shortText || null,
      satisfactionScore: summary?.satisfactionScore || null,
      status: summary?.status?.toLowerCase() || 'pending',
    };
  }

  async generateSummary({ surveyId }: CreateClimateSummaryDto): Promise<{
    text: string;
    shortText: string;
    satisfactionScore: number;
    status: string;
  }> {
    console.log(`Gerando resumo para pesquisa ${surveyId}`);

    // Primeiro, verifica se já existe um resumo em processamento
    const existingSummary = await this.prisma.climateSurveyAISummary.findUnique(
      {
        where: { surveyId },
      },
    );

    if (existingSummary?.status === 'PROCESSING') {
      throw new Error(
        'Já existe um resumo sendo gerado para esta pesquisa. Aguarde a conclusão.',
      );
    }

    // Cria ou atualiza o registro com status 'processing'
    await this.prisma.climateSurveyAISummary.upsert({
      where: { surveyId },
      update: {
        status: 'PROCESSING',
        text: null,
      },
      create: {
        surveyId,
        status: 'PROCESSING',
        text: null,
      },
    });

    try {
      const responses = await this.prisma.climateSurveyResponse.findMany({
        where: { surveyId, isSubmit: true },
        include: { answers: { include: { question: true } } },
      });

      console.log(`Encontradas ${responses.length} respostas para a pesquisa`);

      if (!responses.length) {
        // Atualiza status para failed
        await this.prisma.climateSurveyAISummary.update({
          where: { surveyId },
          data: { status: 'FAILED' },
        });
        throw new Error('Nenhuma resposta encontrada para essa pesquisa.');
      }

      // Gera os três tipos de conteúdo
      console.log('Gerando resumo completo...');
      const fullPrompt = this.buildPrompt(responses);
      const fullResponse = await this.geminiService.generate(fullPrompt);

      console.log('Gerando resumo curto...');
      const shortPrompt = this.buildShortPrompt(responses);
      const shortResponse = await this.geminiService.generate(shortPrompt);

      console.log('Calculando score de satisfação...');
      const satisfactionPrompt = this.buildSatisfactionPrompt(responses);
      const satisfactionResponse =
        await this.geminiService.generate(satisfactionPrompt);

      // Valida as respostas
      if (!fullResponse || !shortResponse || !satisfactionResponse) {
        await this.prisma.climateSurveyAISummary.update({
          where: { surveyId },
          data: { status: 'FAILED' },
        });
        throw new Error('A IA retornou uma resposta vazia');
      }

      // Converte o score de satisfação para número
      const satisfactionScore = parseInt(satisfactionResponse.trim());
      if (
        isNaN(satisfactionScore) ||
        satisfactionScore < 0 ||
        satisfactionScore > 100
      ) {
        await this.prisma.climateSurveyAISummary.update({
          where: { surveyId },
          data: { status: 'FAILED' },
        });
        throw new Error('Score de satisfação inválido');
      }

      console.log('Respostas geradas:', {
        full: fullResponse.substring(0, 100) + '...',
        short: shortResponse,
        satisfaction: satisfactionScore,
      });

      // Atualiza com todos os dados gerados
      await this.prisma.climateSurveyAISummary.update({
        where: { surveyId },
        data: {
          text: fullResponse,
          shortText: shortResponse,
          satisfactionScore: satisfactionScore,
          status: 'COMPLETED',
        },
      });

      return {
        text: fullResponse,
        shortText: shortResponse,
        satisfactionScore: satisfactionScore,
        status: 'completed',
      };
    } catch (error) {
      console.error('Erro ao gerar resumo com IA:', error);

      // Atualiza status para failed
      await this.prisma.climateSurveyAISummary.update({
        where: { surveyId },
        data: { status: 'FAILED' },
      });

      throw new Error(`Erro ao gerar resumo: ${error.message}`);
    }
  }

  async getAllSummaries() {
    // Busca todos os resumos de IA e inclui dados da pesquisa
    const summaries = await this.prisma.climateSurveyAISummary.findMany({
      include: {
        survey: {
          select: {
            title: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        survey: { endDate: 'desc' },
      },
    });

    // Formata para o frontend
    return summaries.map((s) => ({
      surveyId: s.surveyId,
      satisfactionScore: s.satisfactionScore,
      shortText: s.shortText,
      createdAt: s.createdAt,
      title: s.survey?.title,
      endDate: s.survey?.endDate,
    }));
  }

  private buildPrompt(responses: any[]): string {
    let prompt = `Você é um sistema de RH especializado em análises de clima organizacional.\n`;
    prompt += `Abaixo estão respostas dos colaboradores para uma pesquisa:\n`;

    for (const response of responses) {
      prompt += `\nResposta:\n`;
      for (const answer of response.answers) {
        prompt += `Pergunta: "${answer.question.text}"\n`;
        prompt += `Nível de concordância: ${answer.level.replaceAll('_', ' ')}\n`;
        if (answer.justification) {
          prompt += `Justificativa: "${answer.justification}"\n`;
        }
      }
    }

    prompt += `\nAnalise e gere um resumo dos principais pontos fortes, pontos de melhoria e sinais de alerta.\n`;
    prompt += `Considere o contexto das perguntas para interpretar a resposta. Seja direto e objetivo (máximo 5 linhas).\n`;

    return prompt;
  }

  private buildShortPrompt(responses: any[]): string {
    let prompt = `Você é um sistema de RH especializado em análises de clima organizacional.\n`;
    prompt += `Abaixo estão respostas dos colaboradores para uma pesquisa:\n`;

    for (const response of responses) {
      prompt += `\nResposta:\n`;
      for (const answer of response.answers) {
        prompt += `Pergunta: "${answer.question.text}"\n`;
        prompt += `Nível de concordância: ${answer.level.replaceAll('_', ' ')}\n`;
        if (answer.justification) {
          prompt += `Justificativa: "${answer.justification}"\n`;
        }
      }
    }

    prompt += `\nGere um resumo MUITO CURTO (máximo 1 linha) sobre o clima organizacional geral.\n`;
    prompt += `Seja conciso e direto ao ponto. Use no máximo 150 caracteres.\n`;

    return prompt;
  }

  private buildSatisfactionPrompt(responses: any[]): string {
    let prompt = `Você é um sistema de RH especializado em análises de clima organizacional.\n`;
    prompt += `Abaixo estão respostas dos colaboradores para uma pesquisa:\n`;

    for (const response of responses) {
      prompt += `\nResposta:\n`;
      for (const answer of response.answers) {
        prompt += `Pergunta: "${answer.question.text}"\n`;
        prompt += `Nível de concordância: ${answer.level.replaceAll('_', ' ')}\n`;
        if (answer.justification) {
          prompt += `Justificativa: "${answer.justification}"\n`;
        }
      }
    }

    prompt += `\nCom base nas respostas, calcule um score de satisfação geral dos colaboradores.\n`;
    prompt += `Considere os níveis de concordância:\n`;
    prompt += `- CONCORDO_TOTALMENTE = 100 pontos\n`;
    prompt += `- CONCORDO_PARCIALMENTE = 75 pontos\n`;
    prompt += `- NEUTRO = 50 pontos\n`;
    prompt += `- DISCORDO_PARCIALMENTE = 25 pontos\n`;
    prompt += `- DISCORDO_TOTALMENTE = 0 pontos\n`;
    prompt += `\nRetorne APENAS um número inteiro entre 0 e 100, sem texto adicional.\n`;

    return prompt;
  }
}
