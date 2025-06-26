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

  remove(id: number) {
    return this.prisma.criterionGroup.delete({ where: { id } });
  }
} 