import { IsString, IsOptional, IsNumber } from 'class-validator';

export class GenerateCustomDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;
}
