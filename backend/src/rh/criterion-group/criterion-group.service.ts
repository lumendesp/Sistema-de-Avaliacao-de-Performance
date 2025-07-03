import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCriterionGroupDto } from './dto/create-criterion-group.dto';
import { UpdateCriterionGroupDto } from './dto/update-criterion-group.dto';

@Injectable()
export class CriterionGroupService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateCriterionGroupDto) {
    return this.prisma.criterionGroup.create({ data });
  }

  findAll() {
    return this.prisma.criterionGroup.findMany();
  }

  findOne(id: number) {
    return this.prisma.criterionGroup.findUnique({ where: { id } });
  }

  update(id: number, data: UpdateCriterionGroupDto) {
    return this.prisma.criterionGroup.update({ where: { id }, data });
  }

  async remove(id: number) {
    return this.prisma.$transaction(async (prisma) => {
      // First delete all configured criteria associated with this group
      await prisma.configuredCriterion.deleteMany({
        where: { groupId: id }
      });
      
      // Then delete the criterion group
      return prisma.criterionGroup.delete({ where: { id } });
    });
  }
} 