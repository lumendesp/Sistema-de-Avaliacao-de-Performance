import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdatePdiActionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  dueDate?: string; // ISO string

  @IsOptional()
  @IsNumber()
  progress?: number;

  @IsOptional()
  goals?: any; // array de metas: [{ id, descricao, concluida }]
} 