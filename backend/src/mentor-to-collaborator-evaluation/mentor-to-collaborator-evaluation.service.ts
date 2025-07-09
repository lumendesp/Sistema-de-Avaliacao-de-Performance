import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMentorToCollaboratorEvaluationDto } from './dto/create-mentor-to-collaborator-evaluation.dto';
import { encrypt } from '../utils/encryption';

@Injectable()
export class MentorToCollaboratorEvaluationService {
  constructor(private prisma: PrismaService) {}

  async create(
    evaluatorId: number,
    roles: string[],
    dto: CreateMentorToCollaboratorEvaluationDto,
  ) {
    // Permissão: apenas MENTOR ou ADMIN podem criar avaliação
    if (!roles.includes('MENTOR') && !roles.includes('ADMIN')) {
      throw new ForbiddenException(
        'Apenas mentores ou administradores podem enviar esta avaliação.',
      );
    }
    // Verifica se já existe avaliação do mesmo mentor para o mesmo colaborador no mesmo ciclo
    const existing = await this.prisma.mentorToCollaboratorEvaluation.findFirst(
      {
        where: {
          evaluatorId,
          evaluateeId: dto.evaluateeId,
          cycleId: dto.cycleId,
        },
      },
    );
    if (existing) {
      throw new ForbiddenException(
        'You have already evaluated this collaborator in this cycle.',
      );
    }
    return this.prisma.mentorToCollaboratorEvaluation.create({
      data: {
        evaluatorId,
        evaluateeId: dto.evaluateeId,
        cycleId: dto.cycleId,
        score: dto.score,
        justification: encrypt(dto.justification),
      },
    });
  }

  async getByMentor(mentorId: number) {
    return this.prisma.mentorToCollaboratorEvaluation.findMany({
      where: { evaluatorId: mentorId },
      include: { evaluatee: true, cycle: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getByCollaborator(collaboratorId: number) {
    return this.prisma.mentorToCollaboratorEvaluation.findMany({
      where: { evaluateeId: collaboratorId },
      include: { evaluator: true, cycle: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
