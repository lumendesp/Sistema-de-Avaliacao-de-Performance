import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';

@Injectable()
export class UnitService {
  constructor(private prisma: PrismaService) {}

  async create(createUnitDto: CreateUnitDto) {
    return this.prisma.unit.create({
      data: createUnitDto,
    });
  }

  async findAll() {
    return this.prisma.unit.findMany({
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
            position: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const unit = await this.prisma.unit.findUnique({
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
            position: true,
          },
        },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Unit with ID ${id} not found`);
    }

    return unit;
  }

  async update(id: number, updateUnitDto: UpdateUnitDto) {
    await this.findOne(id);
    return this.prisma.unit.update({
      where: { id },
      data: updateUnitDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.unit.delete({
      where: { id },
    });
  }
} 