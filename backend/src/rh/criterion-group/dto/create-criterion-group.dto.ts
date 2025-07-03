import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateCriterionGroupDto {
  @ApiProperty({ 
    description: 'Nome do grupo de critérios',
    example: 'Comportamento' 
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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
}