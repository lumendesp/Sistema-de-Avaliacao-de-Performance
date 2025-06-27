import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReferenceDto } from './dto/create-reference.dto';

@Injectable()
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  async createReference(providerId: number, dto: CreateReferenceDto) {
    const { receiverId, cycleId, justification } = dto;

    const existing = await this.prisma.reference.findFirst({
      where: {
        providerId,
        receiverId,
        cycleId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Você já adicionou uma referência para essa pessoa neste ciclo.',
      );
    }

    return this.prisma.reference.create({
      data: {
        providerId,
        receiverId,
        cycleId,
        justification,
      },
    });
  }

  async getReferencesByCycle(cycleId: number) {
    return this.prisma.reference.findMany({
      where: { cycleId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
    });
  }

  async getSentReferencesByCycle(cycleId: number, userId: number) {
    return this.prisma.reference.findMany({
      where: {
        cycleId,
        providerId: userId,
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
    });
  }

  async getReceivedReferencesByCycle(cycleId: number, userId: number) {
    return this.prisma.reference.findMany({
      where: {
        cycleId,
        receiverId: userId,
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            photo: true,
          },
        },
      },
    });
  }

  async findAllByProviderAndCycle(providerId: number, cycleId: number) {
    return this.prisma.reference.findMany({
      where: { providerId, cycleId },
      include: {
        receiver: true, // traz dados do colaborador que recebeu a referência
      },
    });
  }
}
