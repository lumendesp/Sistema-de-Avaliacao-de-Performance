import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateClimateSurveyDto } from './dto/create-climate-survey.dto';
import { CloseSurveyDto } from './dto/close-climate-survey.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

@Injectable()
export class RhService {
  constructor(private prisma: PrismaService) {}

  async createSurvey(userId: number, dto: CreateClimateSurveyDto) {
    const { title, description, questions, endDate } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user || !user.roles.some((r) => r.role === 'HR')) {
      throw new ForbiddenException('Apenas RH pode criar pesquisas de clima');
    }

    const survey = await this.prisma.climateSurvey.create({
      data: {
        title,
        description,
        endDate: new Date(endDate),
        createdById: userId,
        questions: {
          create: questions.map((q, index) => ({
            text: q.text,
          })),
        },
      },
      include: {
        questions: true,
      },
    });

    return survey;
  }

  async getSurveySummaries(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user || !user.roles.some((r) => r.role === 'HR')) {
      throw new ForbiddenException('Apenas RH pode visualizar pesquisas');
    }

    return this.prisma.climateSurvey.findMany({
      // where: {
      //   createdById: userId,
      // },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        endDate: true,
        isActive: true,
        _count: {
          select: { responses: true },
        },
      },
    });
  }

  async getSurveyById(userId: number, surveyId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user || !user.roles.some((r) => r.role === 'HR')) {
      throw new ForbiddenException('Apenas RH pode visualizar pesquisas');
    }

    const survey = await this.prisma.climateSurvey.findUnique({
      where: {
        id: surveyId,
        // createdById: userId,
      },
      include: {
        questions: true,
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Pesquisa não encontrada');
    }

    return survey;
  }

  async getSurveyResponses(userId: number, surveyId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user || !user.roles.some((r) => r.role === 'HR')) {
      throw new ForbiddenException('Apenas RH pode visualizar respostas');
    }

    const survey = await this.prisma.climateSurvey.findUnique({
      where: { id: surveyId },
      include: {
        responses: {
          include: {
            answers: {
              include: {
                question: true,
              },
            },
          },
        },
      },
    });

    if (!survey) {
      throw new NotFoundException('Pesquisa não encontrada');
    }

    return survey.responses;
  }

  async closeSurvey(userId: number, surveyId: number, dto: CloseSurveyDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user || !user.roles.some((r) => r.role === 'HR')) {
      throw new ForbiddenException('Apenas RH pode encerrar pesquisas');
    }

    const survey = await this.prisma.climateSurvey.findUnique({
      where: { id: surveyId },
    });
    if (!survey) throw new NotFoundException('Pesquisa não encontrada');

    return this.prisma.climateSurvey.update({
      where: { id: surveyId },
      data: {
        isActive: false,
        endDate: dto.endDate ? new Date(dto.endDate) : survey.endDate,
      },
    });
  }

  async reopenSurvey(surveyId: number) {
    // Atualiza a pesquisa para reativar
    return await this.prisma.climateSurvey.update({
      where: { id: surveyId },
      data: {
        isActive: true,
      },
    });
  }

  async countCollaborators() {
    return this.prisma.user.count({
      where: {
        roles: {
          some: {
            role: 'COLLABORATOR',
          },
        },
      },
    });
  }

  async getSurveyAverages(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });

    if (!user || !user.roles.some((r) => r.role === 'HR')) {
      throw new ForbiddenException('Apenas RH pode visualizar pesquisas');
    }

    // Mapeamento ClimateLevel para escala 1 a 5
    const climateLevelMap = {
      DISCORDO_TOTALMENTE: 1,
      DISCORDO_PARCIALMENTE: 2,
      NEUTRO: 3,
      CONCORDO_PARCIALMENTE: 4,
      CONCORDO_TOTALMENTE: 5,
    };

    const surveys = await this.prisma.climateSurvey.findMany({
      where: { isActive: false, createdById: userId },
      include: {
        responses: {
          where: { isSubmit: true },
          include: {
            answers: true,
          },
        },
      },
      orderBy: { endDate: 'asc' },
    });

    return surveys.map((survey) => {
      const allAnswers = survey.responses.flatMap((r) => r.answers);
      const allScores = allAnswers.map((a) => climateLevelMap[a.level]);
      const averageScore = allScores.length
        ? allScores.reduce((sum, v) => sum + v, 0) / allScores.length
        : null;
      return {
        id: survey.id,
        title: survey.title,
        endDate: survey.endDate,
        averageScore:
          averageScore !== null ? Number(averageScore.toFixed(2)) : null,
      };
    });
  }
}
