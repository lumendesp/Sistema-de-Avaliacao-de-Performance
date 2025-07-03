import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateTrackDto {
  @ApiProperty({
    description: 'Nome da track',
    example: 'Frontend Developer',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
} 