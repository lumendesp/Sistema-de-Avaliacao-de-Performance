import { IsInt, IsString, IsOptional } from 'class-validator';

export class CreatePdiDto {
  @IsInt()
  userId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;
} 