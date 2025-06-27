import { PartialType } from '@nestjs/mapped-types';
import { CreateCriterionDto } from './create-criterion.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsInt, IsEnum } from 'class-validator';
import { CriterionName } from '@prisma/client';

export class UpdateCriterionDto extends PartialType(CreateCriterionDto) {
  @ApiProperty({ 
    description: 'Nome do critério', 
    enum: CriterionName,
    example: CriterionName.ORGANIZACAO_NO_TRABALHO,
    required: false 
  })
  @IsOptional()
  @IsEnum(CriterionName)
  name?: CriterionName;

  @ApiProperty({ description: 'Descrição geral do critério', example: 'Capacidade de manter o ambiente organizado.', required: false })
  @IsOptional()
  @IsString()
  generalDescription?: string;

  @ApiProperty({ description: 'Critério ativo?', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ description: 'Peso do critério', example: 10, required: false })
  @IsOptional()
  @IsInt()
  weight?: number;
} 