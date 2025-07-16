import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { CycleStatus } from '@prisma/client';

export class UpdateCicloDto {
  @ApiPropertyOptional({ example: '2024.1' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-06-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'CLOSED', enum: CycleStatus, description: 'Status do ciclo' })
  @IsOptional()
  @IsEnum(CycleStatus)
  status?: CycleStatus;
}

export class UpdateCycleStatusDto {
  @ApiPropertyOptional({ example: 'IN_PROGRESS_MANAGER', enum: CycleStatus, description: 'Novo status do ciclo' })
  @IsEnum(CycleStatus)
  status: CycleStatus;
}
