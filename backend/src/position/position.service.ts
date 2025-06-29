import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
  constructor(private prisma: PrismaService) {}

  async create(createPositionDto: CreatePositionDto) {
    return this.prisma.position.create({
      data: createPositionDto,
    });
  }

  async findAll() {
    return this.prisma.position.findMany({
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
            track: true,
            unit: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const position = await this.prisma.position.findUnique({
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
            track: true,
            unit: true,
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  async update(id: number, updatePositionDto: UpdatePositionDto) {
    await this.findOne(id);
    return this.prisma.position.update({
      where: { id },
      data: updatePositionDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.position.delete({
      where: { id },
    });
  }
} 