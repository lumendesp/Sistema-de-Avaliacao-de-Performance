import { Injectable } from '@nestjs/common';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class NotasService {
  async create(createNotaDto: CreateNotaDto) {
    return prisma.finalScore.create({
      data: createNotaDto,
    });
  }

  findAll() {
    return prisma.finalScore.findMany();
  }

  findOne(id: number) {
    return prisma.finalScore.findUnique({ where: { id } });
  }

  update(id: number, updateNotaDto: UpdateNotaDto) {
    return prisma.finalScore.update({
      where: { id },
      data: updateNotaDto,
    });
  }

  remove(id: number) {
    return prisma.finalScore.delete({ where: { id } });
  }
}
