import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { decrypt } from '../utils/encryption';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // função para criar um novo usuário
  async create(createUserDto: CreateUserDto) {
    // aqui é a senha sendo criptografada antes de ser salva no banco
    // 10 significa 10 rounds de salt, é basicamente a quantidade de ciclos que o algoritmo vai dar para gerar o hash, é a força da criptografia
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // cria o usuário no banco
    const user = await this.prisma.user.create({
      data: {
        ...createUserDto, // os campos do dto
        password: hashedPassword, // a senha já com hash
        roles: {
          // as roles são salvas numa tabela separada
          create: createUserDto.roles.map((r) => ({ role: r.role })),
        },
      },
      include: { roles: true },
    });
    return user;
  }

  // função que retorna todos os usuários
  async findAll() {
    return this.prisma.user.findMany({
      include: { roles: true, unit: true, position: true, track: true },
    });
  }

  // função que retorna colaboradores com dados de avaliação para o dashboard
  async findCollaboratorsForDashboard() {
    return this.prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: 'COLLABORATOR',
          },
        },
      },
      include: {
        roles: true,
        unit: true,
        position: true,
        track: true,
        finalScores: {
          include: {
            cycle: true,
          },
        },
        selfEvaluations: {
          include: {
            items: true,
          },
        },
        managerEvaluationsReceived: {
          include: {
            items: true,
          },
        },
      },
    });
  }

  // função para buscar um usuário pelo id
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true, unit: true, position: true, track: true },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  // função para atualizar campos do usuário
  async update(id: number, updateUserDto: UpdateUserDto) {
    // campos que podem ser atualizados
    const dataToUpdate: any = {
      name: updateUserDto.name,
      email: updateUserDto.email,
      username: updateUserDto.username,
      active: updateUserDto.active,
      photo: updateUserDto.photo,
      positionId: updateUserDto.positionId,
      unitId: updateUserDto.unitId,
      trackId: updateUserDto.trackId,
    };

    // se tiver senha no dto para ser atualizada, deve ser criptografada novamente
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // se tiver roles no dto para serem atualizadas, vão ser atualizadas de forma separada
    if (updateUserDto.roles) {
      // primeiro remove as roles antigas
      await this.prisma.userRole.deleteMany({
        where: { userId: id },
      });

      // agora adiciona as novas roles, ou seja, se quiser manter as roles antigas e adicionar novas, deve incluir elas no patch também
      dataToUpdate.roles = {
        create: updateUserDto.roles.map((roleDto) => ({
          role: roleDto.role,
        })),
      };
    }

    // Atualiza o usuário com dados básicos + roles (se houve update)
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: { roles: true }, // para retornar com roles
    });

    return updatedUser;
  }

  // função para remover um usuário
  async remove(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
    return { message: `User ${id} deleted` };
  }

  // função para buscar usuários com suas avaliações (para o comitê)
  async findUsersWithEvaluations() {
    const users = await this.prisma.user.findMany({
      include: {
        roles: true,
        unit: true,
        position: true,
        track: true,
        selfEvaluations: {
          include: {
            items: {
              include: {
                criterion: true,
              },
            },
            cycle: true,
          },
        },
        peerEvaluationsReceived: {
          include: {
            evaluator: { select: { id: true, name: true } },
            cycle: true,
          },
        },
        managerEvaluationsReceived: {
          include: {
            evaluator: { select: { id: true, name: true } },
            cycle: true,
            items: {
              include: {
                criterion: true,
              },
            },
          },
        },
        mentorEvaluationsReceived: {
          include: {
            evaluator: { select: { id: true, name: true } },
            cycle: true,
          },
        },
        finalScores: {
          include: {
            cycle: true,
            adjuster: { select: { id: true, name: true } },
          },
        },
        referencesReceived: {
          include: {
            provider: { select: { id: true, name: true, email: true } },
            cycle: true,
          },
        },
      },
    });

    // Transform the data to match the frontend expectations
    return users.map(user => {
      const evaluationsEvaluated = [
        // Self evaluations
        ...user.selfEvaluations.map(evaluation => ({
          id: evaluation.id,
          type: 'SELF',
          score: evaluation.items.reduce((sum, item) => sum + item.score, 0) / evaluation.items.length || 0,
          justification: evaluation.items.map(item => decrypt(item.justification)).join(' '),
          evaluator: { id: user.id, name: user.name },
          cycle: evaluation.cycle,
          items: evaluation.items.map(item => ({
            ...item,
            justification: decrypt(item.justification)
          })),
        })),
        // Peer evaluations
        ...user.peerEvaluationsReceived.map(evaluation => ({
          id: evaluation.id,
          type: 'PEER',
          score: evaluation.score,
          justification: `${decrypt(evaluation.strengths)} ${decrypt(evaluation.improvements)}`,
          evaluator: evaluation.evaluator,
          cycle: evaluation.cycle,
        })),
        // Mentor evaluations
        ...user.mentorEvaluationsReceived.map(evaluation => ({
          id: evaluation.id,
          type: 'MENTOR',
          score: evaluation.score,
          justification: decrypt(evaluation.justification),
          evaluator: evaluation.evaluator,
          cycle: evaluation.cycle,
        })),
        // Manager evaluations
        ...user.managerEvaluationsReceived.map(evaluation => ({
          id: evaluation.id,
          type: 'MANAGER',
          score: evaluation.items.reduce((sum, item) => sum + item.score, 0) / evaluation.items.length || 0,
          justification: evaluation.items.map(item => decrypt(item.justification)).join(' '),
          evaluator: evaluation.evaluator,
          cycle: evaluation.cycle,
          items: evaluation.items.map(item => ({
            ...item,
            justification: decrypt(item.justification)
          })),
        })),
        // Final evaluations
        ...user.finalScores.map(evaluation => ({
          id: evaluation.id,
          type: 'FINAL',
          score: evaluation.finalScore || 0,
          justification: evaluation.justification, // Final scores are not encrypted
          evaluator: evaluation.adjuster,
          cycle: evaluation.cycle,
        })),
      ];

      const hasAllEvaluations = user.selfEvaluations.length > 0 && 
                               user.peerEvaluationsReceived.length > 0 && 
                               user.managerEvaluationsReceived.length > 0 && 
                               user.finalScores.length > 0;

      return {
        ...user,
        evaluationsEvaluated,
        hasAllEvaluations,
        referencesReceived: user.referencesReceived || [],
      };
    });
  }

  async detectSignificantDrops(userId: number, currentCycleId: number) {
    // Get current cycle
    const currentCycle = await this.prisma.evaluationCycle.findUnique({
      where: { id: currentCycleId }
    });

    if (!currentCycle) {
      return null;
    }

    // Get previous cycles (ordered by start date descending)
    const previousCycles = await this.prisma.evaluationCycle.findMany({
      where: {
        startDate: { lt: currentCycle.startDate },
        status: { in: ['CLOSED', 'PUBLISHED'] }
      },
      orderBy: { startDate: 'desc' },
      take: 1 // Get the most recent previous cycle
    });

    if (previousCycles.length === 0) {
      return null; // No previous cycles to compare
    }

    const previousCycle = previousCycles[0];
    const drops: Array<{ type: string; currentScore: number; previousScore: number; dropPercent: number; message: string }> = [];

    // Compare Self Evaluation
    const currentSelf = await this.prisma.selfEvaluation.findFirst({
      where: { userId, cycleId: currentCycleId },
      include: { items: true }
    });

    const previousSelf = await this.prisma.selfEvaluation.findFirst({
      where: { userId, cycleId: previousCycle.id },
      include: { items: true }
    });

    if (currentSelf && previousSelf && currentSelf.items.length > 0 && previousSelf.items.length > 0) {
      const currentAvg = currentSelf.items.reduce((sum, item) => sum + item.score, 0) / currentSelf.items.length;
      const previousAvg = previousSelf.items.reduce((sum, item) => sum + item.score, 0) / previousSelf.items.length;
      
      if (currentAvg < previousAvg) {
        const dropPercent = ((previousAvg - currentAvg) / previousAvg) * 100;
        if (dropPercent >= 20) { // 20% threshold for significant drop
          drops.push({
            type: 'SELF',
            currentScore: currentAvg,
            previousScore: previousAvg,
            dropPercent: parseFloat(dropPercent.toFixed(2)),
            message: `Autoavaliação caiu de ${previousAvg.toFixed(1)} para ${currentAvg.toFixed(1)}`
          });
        }
      }
    }

    // Compare Peer Evaluation
    const currentPeer = await this.prisma.peerEvaluation.findMany({
      where: { evaluateeId: userId, cycleId: currentCycleId }
    });

    const previousPeer = await this.prisma.peerEvaluation.findMany({
      where: { evaluateeId: userId, cycleId: previousCycle.id }
    });

    if (currentPeer.length > 0 && previousPeer.length > 0) {
      const currentAvg = currentPeer.reduce((sum, evaluation) => sum + evaluation.score, 0) / currentPeer.length;
      const previousAvg = previousPeer.reduce((sum, evaluation) => sum + evaluation.score, 0) / previousPeer.length;
      
      if (currentAvg < previousAvg) {
        const dropPercent = ((previousAvg - currentAvg) / previousAvg) * 100;
        if (dropPercent >= 20) {
          drops.push({
            type: 'PEER',
            currentScore: currentAvg,
            previousScore: previousAvg,
            dropPercent: parseFloat(dropPercent.toFixed(2)),
            message: `Avaliação 360° caiu de ${previousAvg.toFixed(1)} para ${currentAvg.toFixed(1)}`
          });
        }
      }
    }

    // Compare Mentor Evaluation
    const currentMentor = await this.prisma.mentorEvaluation.findFirst({
      where: { evaluateeId: userId, cycleId: currentCycleId }
    });

    const previousMentor = await this.prisma.mentorEvaluation.findFirst({
      where: { evaluateeId: userId, cycleId: previousCycle.id }
    });

    if (currentMentor && previousMentor) {
      if (currentMentor.score < previousMentor.score) {
        const dropPercent = ((previousMentor.score - currentMentor.score) / previousMentor.score) * 100;
        if (dropPercent >= 20) {
          drops.push({
            type: 'MENTOR',
            currentScore: currentMentor.score,
            previousScore: previousMentor.score,
            dropPercent: parseFloat(dropPercent.toFixed(2)),
            message: `Avaliação do mentor caiu de ${previousMentor.score} para ${currentMentor.score}`
          });
        }
      }
    }

    // Compare Manager Evaluation
    const currentManager = await this.prisma.managerEvaluation.findMany({
      where: { evaluateeId: userId, cycleId: currentCycleId },
      include: { items: true }
    });

    const previousManager = await this.prisma.managerEvaluation.findMany({
      where: { evaluateeId: userId, cycleId: previousCycle.id },
      include: { items: true }
    });

    if (currentManager.length > 0 && previousManager.length > 0) {
      const currentAvg = currentManager.reduce((sum, evaluation) => {
        const itemAvg = evaluation.items.reduce((itemSum, item) => itemSum + item.score, 0) / evaluation.items.length;
        return sum + itemAvg;
      }, 0) / currentManager.length;

      const previousAvg = previousManager.reduce((sum, evaluation) => {
        const itemAvg = evaluation.items.reduce((itemSum, item) => itemSum + item.score, 0) / evaluation.items.length;
        return sum + itemAvg;
      }, 0) / previousManager.length;
      
      if (currentAvg < previousAvg) {
        const dropPercent = ((previousAvg - currentAvg) / previousAvg) * 100;
        if (dropPercent >= 20) {
          drops.push({
            type: 'MANAGER',
            currentScore: currentAvg,
            previousScore: previousAvg,
            dropPercent: parseFloat(dropPercent.toFixed(2)),
            message: `Avaliação do gestor caiu de ${previousAvg.toFixed(1)} para ${currentAvg.toFixed(1)}`
          });
        }
      }
    }

    // Return the most significant drop (highest percentage)
    if (drops.length > 0) {
      const mostSignificantDrop = drops.reduce((max, drop) => 
        drop.dropPercent > max.dropPercent ? drop : max
      );
      
      return {
        ...mostSignificantDrop,
        previousCycleName: previousCycle.name,
        currentCycleName: currentCycle.name
      };
    }

    return null;
  }
}
