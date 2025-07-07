import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAiBrutalFactDto {
  @ApiProperty({ example: 1, description: 'ID do ciclo' })
  @IsInt()
  cycleId: number;

  @ApiProperty({ example: 'Seu prompt aqui', description: 'Prompt para a IA gerar o insight' })
  @IsString()
  prompt: string;
} 