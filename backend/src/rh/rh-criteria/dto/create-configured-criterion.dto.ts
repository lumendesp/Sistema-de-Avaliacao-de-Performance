import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsBoolean, IsString } from 'class-validator';

export class CreateConfiguredCriterionDto {
  @ApiProperty({ 
    description: 'ID do critério',
    example: 1 
  })
  @IsInt()
  criterionId: number;

  @ApiProperty({ 
    description: 'ID do grupo de critérios',
    example: 1 
  })
  @IsInt()
  groupId: number;

  @ApiProperty({ 
    description: 'ID da trilha',
    example: 1 
  })
  @IsInt()
  trackId: number;

  @ApiProperty({ 
    description: 'ID da unidade',
    example: 1 
  })
  @IsInt()
  unitId: number;

  @ApiProperty({ 
    description: 'ID da posição',
    example: 1 
  })
  @IsInt()
  positionId: number;

  @ApiProperty({ 
    description: 'Critério obrigatório?',
    default: false
  })
  @IsBoolean()
  mandatory: boolean;

  @ApiProperty({
    description: 'Peso do critério (específico para a trilha/pilar)',
    example: 10
  })
  @IsInt()
  weight: number;

  @ApiProperty({
    description: 'Descrição do critério (específica para a trilha/pilar)',
    example: 'Descrição customizada'
  })
  @IsString()
  description: string;
} 