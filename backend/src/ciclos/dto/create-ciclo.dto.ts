import { IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CycleStatus } from '@prisma/client';

export class CreateCicloDto {
  @ApiProperty({ example: '2024.1' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-06-30' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'IN_PROGRESS', enum: CycleStatus })
  @IsEnum(CycleStatus)
  status: CycleStatus;
}
