import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto) {
    const { positionId, trackId, unitId, ...rest } = createUserDto;
    const data: any = {
      ...rest,
      active: createUserDto.active ?? true,
    };
    if (positionId !== undefined) data.positionId = positionId;
    if (trackId !== undefined) data.trackId = trackId;
    if (unitId !== undefined) data.unitId = unitId;
    return prisma.user.create({ data });
  }

  async findAll() {
    return prisma.user.findMany();
  }

  async findOne(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { positionId, trackId, unitId, ...rest } = updateUserDto;
    const data: any = { ...rest };
    if (updateUserDto.active !== undefined) data.active = updateUserDto.active;
    if (positionId !== undefined) data.positionId = positionId;
    if (trackId !== undefined) data.trackId = trackId;
    if (unitId !== undefined) data.unitId = unitId;
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return prisma.user.delete({ where: { id } });
  }
}
