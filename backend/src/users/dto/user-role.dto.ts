import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserRoleDto {
  @ApiProperty({ example: 'COLLABORATOR', enum: Role, enumName: 'Role' })
  @IsEnum(Role)
  role: Role;
}
