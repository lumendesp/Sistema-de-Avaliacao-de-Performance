import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Evaluation, EvaluationType, EvaluationStatus } from '../../generated/prisma';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Create a new user
  async createUser(data: { email: string; name: string }): Promise<User> {
    return this.prisma.user.create({
      data,
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }

  // Get all users with roles and evaluations
  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true
          }
        },
        evaluationsEvaluated: true,
        evaluationsEvaluator: true,
      },
    });
  }

  // Get a single user by ID
  async getUserById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true
          }
        },
        evaluationsEvaluated: true,
        evaluationsEvaluator: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // Create an evaluation
  async createEvaluation(data: {
    evaluatedId: number;
    evaluatorId: number;
    type: EvaluationType;
    score: number;
    justification: string;
    deadline: Date;
  }): Promise<Evaluation> {
    // Verify both users exist
    await this.getUserById(data.evaluatedId);
    await this.getUserById(data.evaluatorId);

    return this.prisma.evaluation.create({
      data: {
        ...data,
        status: EvaluationStatus.PENDING,
        createdAt: new Date(),
      },
      include: {
        evaluated: true,
        evaluator: true,
      },
    });
  }

  // Update an evaluation (e.g., score or justification)
  async updateEvaluation(
    id: number,
    data: {
      score?: number;
      justification?: string;
      status?: EvaluationStatus;
    }
  ): Promise<Evaluation> {
    const evaluation = await this.prisma.evaluation.findUnique({
      where: { id },
    });

    if (!evaluation) {
      throw new NotFoundException(`Evaluation with ID ${id} not found`);
    }

    return this.prisma.evaluation.update({
      where: { id },
      data,
      include: {
        evaluated: true,
        evaluator: true,
      },
    });
  }

  // Get all evaluations
  async getEvaluations(): Promise<Evaluation[]> {
    return this.prisma.evaluation.findMany({
      include: {
        evaluated: true,
        evaluator: true,
      },
    });
  }

  async assignRoleToUser(userId: number, roleId: number) {
    // Verify user exists
    await this.getUserById(userId);

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        user: true,
        role: true,
      },
    });
  }
} 