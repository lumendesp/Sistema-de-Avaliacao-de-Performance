import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({
    description: 'Nome da unidade',
    example: 'Unidade Principal',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
} 