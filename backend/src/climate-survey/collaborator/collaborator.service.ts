import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SubmitClimateSurveyDto } from './dto/submit-climate-survey';

@Injectable()
export class CollaboratorService {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveSurvey() {
    return this.prisma.climateSurvey.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });
  }

  async submitSurveyResponse(
    surveyId: number,
    dto: SubmitClimateSurveyDto,
    userId: number,
  ) {
    const survey = await this.prisma.climateSurvey.findUnique({
      where: { id: surveyId },
    });

    if (!survey) throw new NotFoundException('Survey not found');

    const existing = await this.prisma.climateSurveyResponse.findFirst({
      where: {
        hashId: dto.hashId,
        surveyId,
        userId,
      },
    });

    let responseId: number;

    if (existing) {
      responseId = existing.id;
      await this.prisma.climateSurveyAnswer.deleteMany({
        where: { responseId },
      });
    } else {
      const response = await this.prisma.climateSurveyResponse.create({
        data: {
          hashId: dto.hashId,
          surveyId,
          isSubmit: dto.isSubmit,
          submittedAt: dto.isSubmit ? new Date() : null,
          userId,
        },
      });
      responseId = response.id;
    }

    await this.prisma.climateSurveyResponse.update({
      where: { id: responseId },
      data: {
        isSubmit: dto.isSubmit,
        submittedAt: dto.isSubmit ? new Date() : null,
        answers: {
          createMany: {
            data: dto.answers.map((a) => ({
              questionId: a.questionId,
              level: a.level,
              justification: a.justification,
            })),
          },
        },
      },
    });

    return { message: 'Survey response submitted successfully' };
  }

  async countAnsweredByUser(userId: number): Promise<{ total: number }> {
    const total = await this.prisma.climateSurveyResponse.groupBy({
      by: ['surveyId'],
      where: { userId },
      _count: true,
    });

    return { total: total.length };
  }
}
