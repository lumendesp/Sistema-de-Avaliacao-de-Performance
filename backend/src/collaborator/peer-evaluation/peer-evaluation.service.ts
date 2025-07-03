import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePeerEvaluationDto } from './dto/create-peer-evaluation.dto';

@Injectable()
export class PeerEvaluationService {
  constructor(private prisma: PrismaService) {}

  async create(evaluatorId: number, dto: CreatePeerEvaluationDto) {
    const { evaluateeId, cycleId, projects, ...evaluationData } = dto;

    // Verifica se avaliador existe
    const evaluatorExists = await this.prisma.user.findUnique({
      where: { id: evaluatorId },
    });
    if (!evaluatorExists) {
      throw new NotFoundException('Evaluator user not found');
    }

    // Verifica se avaliado existe
    const evaluateeExists = await this.prisma.user.findUnique({
      where: { id: evaluateeId },
    });
    if (!evaluateeExists) {
      throw new NotFoundException('Evaluatee user not found');
    }

    // Avaliador não pode avaliar ele mesmo
    if (evaluatorId === evaluateeId) {
      throw new BadRequestException('Evaluator cannot evaluate themselves');
    }

    // Verifica se já existe avaliação do mesmo avaliador para o mesmo avaliado e ciclo
    const existingEvaluation = await this.prisma.peerEvaluation.findFirst({
      where: {
        evaluatorId,
        evaluateeId,
        cycleId,
      },
    });
    if (existingEvaluation) {
      throw new BadRequestException(
        'Evaluation for this evaluatee in this cycle by the evaluator already exists',
      );
    }

    // Valida se todos os projetos existem antes de criar a avaliação
    const validatedProjects: { projectId: number; period: number }[] = [];
    if (projects && projects.length > 0) {
      for (const proj of projects) {
        const projectInDb = await this.prisma.project.findUnique({
          where: { name: proj.name },
        });

        if (!projectInDb) {
          throw new NotFoundException(
            `Project with name "${proj.name}" not found`,
          );
        }

        validatedProjects.push({
          projectId: projectInDb.id,
          period: proj.period,
        });
      }
    }

    // Cria avaliação
    const evaluation = await this.prisma.peerEvaluation.create({
      data: {
        ...evaluationData,
        evaluatorId,
        evaluateeId,
        cycleId,
      },
    });

    // Cria associações de projetos relacionados (se houver)
    if (validatedProjects.length > 0) {
      for (const validatedProj of validatedProjects) {
        await this.prisma.peerEvaluationProject.create({
          data: {
            peerEvaluationId: evaluation.id,
            projectId: validatedProj.projectId,
            period: validatedProj.period,
          },
        });
      }
    }

    // Retorna avaliação com dados relacionados
    return this.prisma.peerEvaluation.findUnique({
      where: { id: evaluation.id },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
        evaluatee: true,
        evaluator: true,
      },
    });
  }

  findByEvaluatorInCycle(evaluatorId: number, cycleId: number) {
    return this.prisma.peerEvaluation.findMany({
      where: {
        evaluatorId,
        cycleId,
      },
      include: {
        evaluatee: true,
        projects: {
          include: {
            project: true,
          },
        },
      },
    });
  }

  findByEvaluateeInCycle(cycleId: number, evaluateeId: number) {
    return this.prisma.peerEvaluation.findMany({
      where: {
        evaluateeId,
        cycleId,
      },
      include: {
        evaluator: true,
        projects: {
          include: {
            project: true,
          },
        },
      },
    });
  }

  async getAverageScoreForUserInCycle(
    userId: number,
    cycleId: number,
  ): Promise<{ average: number }> {
    // aggregate é uma função do prisma que permite fazer operações como avg, sum, count
    const result = await this.prisma.peerEvaluation.aggregate({
      where: {
        evaluateeId: userId,
        cycleId: cycleId,
      },
      // Calcular a média do campo score
      _avg: {
        score: true,
      },
    });

    const average = result._avg.score ?? 0;

    return {
      average: parseFloat(average.toFixed(1)), 
    };
  }

  findOne(id: number) {
    return this.prisma.peerEvaluation.findUnique({
      where: { id },
      include: {
        evaluator: true,
        evaluatee: true,
        projects: {
          include: {
            project: true,
          },
        },
        cycle: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.peerEvaluation.delete({
      where: { id },
    });
  }
}
