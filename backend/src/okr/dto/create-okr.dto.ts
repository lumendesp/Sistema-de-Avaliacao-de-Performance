import { IsInt, IsString, IsArray, IsDateString } from 'class-validator';

export class CreateOkrDto {
  @IsInt()
  userId: number;

  @IsString()
  objective: string;

  @IsDateString()
  dueDate: string;

  @IsArray()
  @IsString({ each: true })
  keyResults: string[];
} 