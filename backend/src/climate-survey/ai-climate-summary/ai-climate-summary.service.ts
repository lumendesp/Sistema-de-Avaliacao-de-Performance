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

      // Gera o resumo completo
      console.log('Gerando resumo completo...');
      const fullPrompt = this.buildPrompt(responses);
      const fullResponse = await this.geminiService.generate(fullPrompt);

      // Gera o resumo curto a partir do resumo completo
      console.log('Gerando resumo curto...');
      const shortPrompt = this.buildShortPromptFromFull(fullResponse);
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
    let prompt = `Você é um analista de RH, especialista em clima organizacional, análise de sentimentos e recomendações estratégicas para melhoria do ambiente de trabalho. Sua missão é ler atentamente as respostas dos colaboradores, verificar a concordância (positiva ou negativa) com o teor da pergunta, identificar padrões emocionais e comportamentais e produzir um resumo em linguagem clara e objetiva, como se estivesse escrevendo para os líderes da empresa.

Seu resumo deve abordar:
- As sensações predominantes expressas pelos colaboradores, como satisfação, motivação, engajamento, ou insatisfação, desmotivação, cansaço, frustração.
- Quais aspectos da empresa mais contribuem para sentimentos positivos.
- Quais fatores causam insatisfação ou impacto negativo no ambiente.
- E, ao final do parágrafo, apresente sugestões práticas de ações que a empresa poderia adotar para melhorar o clima organizacional com base nas respostas analisadas.

Atenção: preste atenção em perguntas com sentido positivo (exemplo: você se sente motivado) e respostas positivas (exemplo: concordo totalmente, me sinto motivado) e em perguntas com sentido negativo (exemplo: você sente que não é reconhecido) e respostas negativas (exemplo: concordo totalmente, não me sinto reconhecido). As vezes, concordar totalmente com algo pode não ser bom no contexto de clima organizacional.

Importante: escreva sempre em um parágrafo único, com conectivos como “além disso”, “por outro lado”, “no entanto”, “em especial”, para manter o texto coeso e fluido. Não utilize listas, enumerações ou tópicos. Use no máximo 6 linhas no total.

### Exemplo prático:
Respostas:

Pergunta: "Me sinto reconhecido pelo meu trabalho."
Nível de concordância: CONCORDO_TOTALMENTE
Justificativa: "Minha liderança sempre reconhece minhas entregas e a equipe é muito colaborativa."

Pergunta: "As metas estabelecidas são claras e alcançáveis."
Nível de concordância: DISCORDO_TOTALMENTE
Justificativa: "Falta clareza nas metas e as mudanças constantes geram insegurança."

Resumo gerado:
As respostas indicam um sentimento geral de reconhecimento e valorização por parte da liderança e da equipe, o que contribui para um ambiente colaborativo e satisfatório. No entanto, são perceptíveis sentimentos de insegurança e frustração relacionados à falta de clareza nas metas e mudanças frequentes que dificultam o alinhamento das expectativas. Para melhorar o clima organizacional, seria recomendável que a empresa investisse em processos mais transparentes de definição de metas, além de treinamentos periódicos para garantir um direcionamento mais estável e confiável para os colaboradores.

---

Agora, com base nas respostas reais abaixo, produza um parágrafo único com no máximo 6 linhas, destacando os sentimentos predominantes, pontos positivos e críticos, além de sugestões objetivas de ações para a empresa.
### Respostas:
`;

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

    return prompt;
  }

  // private buildShortPrompt(responses: any[]): string {
  //   let prompt = `Você é um analista de RH especializado em análises de clima organizacional.\n`;
  //   prompt += `Abaixo estão respostas dos colaboradores para uma pesquisa:\n`;

  //   for (const response of responses) {
  //     prompt += `\nResposta:\n`;
  //     for (const answer of response.answers) {
  //       prompt += `Pergunta: "${answer.question.text}"\n`;
  //       prompt += `Nível de concordância: ${answer.level.replaceAll('_', ' ')}\n`;
  //       if (answer.justification) {
  //         prompt += `Justificativa: "${answer.justification}"\n`;
  //       }
  //     }
  //   }

  //   prompt += `\nGere um resumo MUITO CURTO (máximo 1 linha) sobre o clima organizacional geral.\n`;
  //   prompt += `Seja conciso e direto ao ponto. Use no máximo 150 caracteres.\n`;

  //   return prompt;
  // }

  private buildShortPromptFromFull(fullText: string): string {
    return `Você é um analista de RH especializado em análises de clima organizacional e análise de sentimento no ambiente de trabalho. Seu dever é resumir o texto abaixo em uma única frase de no máximo 150 caracteres, de forma concisa e direta ao ponto. Lembre-se que isso é um insight de como está o clima e o sentimento dos colaboradores, para os líderes da empresa analisarem.\n\n${fullText}`;
  }

  private buildSatisfactionPrompt(responses: any[]): string {
    let prompt = `Você é um analista de RH especializado em análises de clima organizacional e análise de sentimento no ambiente de trabalho. Sua tarefa é mensurar o nível de satisfação dos colaboradores com a empresa, fornecendo uma nota de 0 a 100, onde 0 é muito insatisfeito e 100 é muito satisfeito. Abaixo estão respostas dos colaboradores para uma pesquisa. Analise elas, levando em consideração o teor da pergunta, se é positivo ou negativo e as respostas dos colaboradores para essas perguntas, verificando se eles estão satisfeitos ou não com a empresa.\n\n`;

    prompt += `Cada pergunta pode ser positiva (exemplo: "Sinto que sou valorizado") ou negativa (exemplo: "Sinto que não sou valorizado"). Para calcular o score de satisfação geral, interprete as respostas assim:\n\n`;

    prompt += `- Para perguntas positivas: CONCORDO_TOTALMENTE = 100 pontos, CONCORDO_PARCIALMENTE = 75, NEUTRO = 50, DISCORDO_PARCIALMENTE = 25, DISCORDO_TOTALMENTE = 0.\n`;
    prompt += `- Para perguntas negativas: CONCORDO_TOTALMENTE = 0 pontos, CONCORDO_PARCIALMENTE = 25, NEUTRO = 50, DISCORDO_PARCIALMENTE = 75, DISCORDO_TOTALMENTE = 100.\n\n`;

    prompt += `Calcule a média ponderada geral considerando essas regras e retorne APENAS um número inteiro entre 0 e 100, sem texto adicional.\n\n`;

    prompt += `Respostas:\n`;

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

    return prompt;
  }
}
