import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class UpdateConfiguredCriterionDto {
  @ApiProperty({ 
    description: 'ID do critério',
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsInt()
  criterionId?: number;

  @ApiProperty({ 
    description: 'ID do grupo de critérios',
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsInt()
  groupId?: number;

  @ApiProperty({ 
    description: 'ID da trilha',
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsInt()
  trackId?: number;

  @ApiProperty({ 
    description: 'ID da unidade',
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsInt()
  unitId?: number;

  @ApiProperty({ 
    description: 'ID da posição',
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsInt()
  positionId?: number;

  @ApiProperty({ 
    description: 'Critério obrigatório?',
    default: false,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;
} 