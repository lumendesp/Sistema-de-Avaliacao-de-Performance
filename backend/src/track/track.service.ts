import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@Injectable()
export class TrackService {
  constructor(private prisma: PrismaService) {}

  async create(createTrackDto: CreateTrackDto) {
    return this.prisma.track.create({
      data: createTrackDto,
    });
  }

  async findAll() {
    return this.prisma.track.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        configuredCriteria: {
          include: {
            criterion: true,
            unit: true,
            position: true,
          },
        },
        userHistory: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const track = await this.prisma.track.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        configuredCriteria: {
          include: {
            criterion: true,
            unit: true,
            position: true,
          },
        },
        userHistory: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!track) {
      throw new NotFoundException(`Track with ID ${id} not found`);
    }

    return track;
  }

  async update(id: number, updateTrackDto: UpdateTrackDto) {
    // Verificar se a track existe
    await this.findOne(id);

    return this.prisma.track.update({
      where: { id },
      data: updateTrackDto,
    });
  }

  async remove(id: number) {
    // Verificar se a track existe
    await this.findOne(id);

    return this.prisma.$transaction(async (prisma) => {
      // First delete all configured criteria associated with this track
      await prisma.configuredCriterion.deleteMany({
        where: { trackId: id }
      });
      
      // Delete all criterion groups associated with this track
      await prisma.criterionGroup.deleteMany({
        where: { trackId: id }
      });
      
      // Delete all user track history associated with this track
      await prisma.userTrack.deleteMany({
        where: { trackId: id }
      });
      
      // Finally delete the track
      return prisma.track.delete({
        where: { id },
      });
    });
  }

  // Métodos adicionais para gerenciar histórico de usuários
  async addUserToTrack(trackId: number, userId: number) {
    // Verificar se a track existe
    await this.findOne(trackId);

    // Verificar se o usuário existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Criar entrada no histórico
    return this.prisma.userTrack.create({
      data: {
        userId,
        trackId,
        start: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        track: true,
      },
    });
  }

  async removeUserFromTrack(trackId: number, userId: number) {
    // Encontrar a entrada ativa no histórico
    const userTrack = await this.prisma.userTrack.findFirst({
      where: {
        userId,
        trackId,
        end: null, // Entrada ativa
      },
    });

    if (!userTrack) {
      throw new NotFoundException('User is not currently in this track');
    }

    // Finalizar a entrada no histórico
    return this.prisma.userTrack.update({
      where: { id: userTrack.id },
      data: {
        end: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        track: true,
      },
    });
  }

  async getTrackUsers(trackId: number) {
    // Verificar se a track existe
    await this.findOne(trackId);

    return this.prisma.user.findMany({
      where: {
        trackId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        unit: true,
      },
    });
  }

  async getTrackHistory(trackId: number) {
    // Verificar se a track existe
    await this.findOne(trackId);

    return this.prisma.userTrack.findMany({
      where: { trackId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        start: 'desc',
      },
    });
  }
} 