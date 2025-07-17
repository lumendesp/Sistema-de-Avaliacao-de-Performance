import { IsInt, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePdiActionDto {
  @IsInt()
  pdiId: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  priority: string;

  @IsString()
  status: string;

  @IsString()
  dueDate: string; // ISO string

  @IsNumber()
  progress: number;

  @IsOptional()
  goals?: any; // array de metas: [{ id, descricao, concluida }]
} 