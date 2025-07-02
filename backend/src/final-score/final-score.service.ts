import { Injectable } from '@nestjs/common';
import { CreateFinalScoreDto } from './dto/create-final-score.dto';
import { UpdateFinalScoreDto } from './dto/update-final-score.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FinalScoreService {
  async create(createFinalScoreDto: CreateFinalScoreDto) {
    return prisma.finalScore.create({
      data: createFinalScoreDto,
    });
  }

  findAll() {
    return prisma.finalScore.findMany();
  }

  findOne(id: number) {
    return prisma.finalScore.findUnique({ where: { id } });
  }

  update(id: number, updateFinalScoreDto: UpdateFinalScoreDto) {
    return prisma.finalScore.update({
      where: { id },
      data: updateFinalScoreDto,
    });
  }

  remove(id: number) {
    return prisma.finalScore.delete({ where: { id } });
  }

  async findByUserAndCycle(userId: number, cycleId: number) {
    return prisma.finalScore.findFirst({
      where: { userId, cycleId }
    });
  }
}
