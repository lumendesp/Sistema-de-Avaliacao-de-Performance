import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrackDto {
  @ApiProperty({
    description: 'Nome da track',
    example: 'Frontend Developer',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;
} 