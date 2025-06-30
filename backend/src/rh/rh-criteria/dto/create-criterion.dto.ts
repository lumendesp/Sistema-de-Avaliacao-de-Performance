import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { CriterionName } from '@prisma/client';

export class CreateCriterionDto {
  @ApiProperty({ 
    description: 'Nome do critério', 
    enum: CriterionName,
    example: CriterionName.ORGANIZACAO_NO_TRABALHO 
  })
  @IsEnum(CriterionName)
  @IsNotEmpty()
  name: CriterionName;

  @ApiProperty({ description: 'Descrição geral do critério', example: 'Capacidade de manter o ambiente organizado.' })
  @IsString()
  @IsNotEmpty()
  generalDescription: string;

  @ApiProperty({ description: 'Critério ativo?', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ description: 'Peso do critério', example: 10 })
  @IsInt()
  weight: number;
} 