import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreatePeerEvaluationDto } from './dto/create-peer-evaluation.dto';
import { UpdatePeerEvaluationDto } from './dto/update-peer-evaluation.dto';
import { encrypt, decrypt } from '../../utils/encryption';
import { EvaluationCycleService } from '../../evaluation-cycle/evaluation-cycle.service';

@Injectable()
export class PeerEvaluationService {
  constructor(
    private prisma: PrismaService,
    private cycleService: EvaluationCycleService,
  ) {}

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
        strengths: encrypt(evaluationData.strengths),
        improvements: encrypt(evaluationData.improvements),
        motivation: evaluationData.motivation,
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
    return this.prisma.peerEvaluation
      .findMany({
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
      })
      .then((evals) =>
        evals.map((ev) => ({
          ...ev,
          strengths: decrypt(ev.strengths),
          improvements: decrypt(ev.improvements),
          motivation: ev.motivation,
        })),
      );
  }

  findByEvaluateeInCycle(cycleId: number, evaluateeId: number) {
    return this.prisma.peerEvaluation
      .findMany({
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
      })
      .then((evals) =>
        evals.map((ev) => ({
          ...ev,
          strengths: decrypt(ev.strengths),
          improvements: decrypt(ev.improvements),
          motivation: ev.motivation,
        })),
      );
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
    return this.prisma.peerEvaluation
      .findUnique({
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
      })
      .then((ev) =>
        ev
          ? {
              ...ev,
              strengths: decrypt(ev.strengths),
              improvements: decrypt(ev.improvements),
              motivation: ev.motivation,
            }
          : null,
      );
  }

  async update(
    evaluatorId: number,
    evaluationId: number,
    dto: UpdatePeerEvaluationDto,
  ) {
    // Busca avaliação para garantir que existe e pertence ao avaliador
    try {
      const evaluation = await this.prisma.peerEvaluation.findUnique({
        where: { id: evaluationId },
        include: { cycle: true },
      });

      if (!evaluation) {
        throw new NotFoundException('Peer evaluation not found.');
      }

      if (evaluation.evaluatorId !== evaluatorId) {
        throw new ForbiddenException(
          'You can only update your own evaluations.',
        );
      }

      // Verifica se o ciclo está ativo para permitir atualização
      if (!evaluation.cycle.status.startsWith('IN_PROGRESS_COLLABORATOR')) {
        throw new BadRequestException(
          'Cannot update evaluation after cycle is finished.',
        );
      }

      // Prepara dados para update
      const dataToUpdate: any = {};

      if (dto.score !== undefined) {
        dataToUpdate.score = dto.score;
      }

      if (dto.strengths !== undefined) {
        dataToUpdate.strengths = encrypt(dto.strengths);
      }

      if (dto.improvements !== undefined) {
        dataToUpdate.improvements = encrypt(dto.improvements);
      }

      if (dto.motivation !== undefined) {
        dataToUpdate.motivation = dto.motivation;
      }

      // Atualiza os dados básicos
      const updatedEvaluation = await this.prisma.peerEvaluation.update({
        where: { id: evaluationId },
        data: dataToUpdate,
        include: {
          evaluatee: true,
          cycle: true,
          projects: {
            include: {
              project: true,
            },
          },
        },
      });

      // Atualiza os projetos vinculados (se enviados no DTO)
      if (dto.projects) {
        // Remove vínculos antigos
        await this.prisma.peerEvaluationProject.deleteMany({
          where: { peerEvaluationId: evaluationId },
        });

        for (const proj of dto.projects) {
          const projectInDb = await this.prisma.project.findUnique({
            where: { name: proj.name },
          });

          if (!projectInDb) {
            throw new NotFoundException(
              `Project with name "${proj.name}" not found.`,
            );
          }

          await this.prisma.peerEvaluationProject.create({
            data: {
              peerEvaluationId: evaluationId,
              projectId: projectInDb.id,
              period: proj.period,
            },
          });
        }
      }

      // Retorna com dados descriptografados
      return {
        ...updatedEvaluation,
        strengths: dto.strengths ?? decrypt(updatedEvaluation.strengths),
        improvements:
          dto.improvements ?? decrypt(updatedEvaluation.improvements),
      };
    } catch (error) {
      console.error('Erro ao atualizar avaliação por pares:', error);
      throw error;
    }
  }

  async remove(id: number, evaluatorId: number) {
    const evaluation = await this.prisma.peerEvaluation.findUnique({
      where: { id },
    });

    if (!evaluation) {
      throw new NotFoundException('Peer evaluation not found.');
    }

    if (evaluation.evaluatorId !== evaluatorId) {
      throw new ForbiddenException('You can only delete your own evaluations.');
    }

    if (evaluation.cycleId) {
      const cycle = await this.prisma.evaluationCycle.findUnique({
        where: { id: evaluation.cycleId },
      });

      if (cycle?.status === 'CLOSED') {
        throw new BadRequestException(
          'Cannot delete evaluation after cycle is finished.',
        );
      }
    }

    // Remove os vínculos da avaliação com projetos
    await this.prisma.peerEvaluationProject.deleteMany({
      where: { peerEvaluationId: id },
    });

    // Remove a avaliação
    return this.prisma.peerEvaluation.delete({
      where: { id },
    });
  }

  async findOrCreateEmptyEvaluation(
    evaluatorId: number,
    evaluateeId: number,
    cycleId: number,
  ) {
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

    // Tenta buscar avaliação existente
    let evaluation = await this.prisma.peerEvaluation.findFirst({
      where: {
        evaluatorId,
        evaluateeId,
        cycleId,
      },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
        evaluatee: true,
      },
    });

    if (evaluation) {
      // Retorna com dados descriptografados
      return {
        ...evaluation,
        strengths: decrypt(evaluation.strengths),
        improvements: decrypt(evaluation.improvements),
      };
    }

    // Se não existir, cria uma avaliação vazia
    evaluation = await this.prisma.peerEvaluation.create({
      data: {
        evaluatorId,
        evaluateeId,
        cycleId,
        score: 0.0,
        strengths: encrypt(''),
        improvements: encrypt(''),
        motivation: null,
      },
      include: {
        projects: {
          include: {
            project: true,
          },
        },
        evaluatee: true,
      },
    });

    return {
      ...evaluation,
      strengths: '',
      improvements: '',
    };
  }
}
