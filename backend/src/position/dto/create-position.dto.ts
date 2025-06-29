import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({
    description: 'Nome da posição',
    example: 'Líder',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
} 