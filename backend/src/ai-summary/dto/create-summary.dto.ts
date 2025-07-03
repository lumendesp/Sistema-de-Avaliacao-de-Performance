import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateSummaryDto {
  @ApiProperty({
    description: 'ID do usuário que receberá o resumo gerado pela IA',
    example: 42,
  })
  @IsInt({ message: 'O userId deve ser um número inteiro.' })
  @IsPositive({ message: 'O userId deve ser um número positivo.' })
  userId: number;

  @ApiProperty({
    description: 'ID do ciclo de avaliação do qual o resumo será gerado',
    example: 3,
  })
  @IsInt({ message: 'O cycleId deve ser um número inteiro.' })
  @IsPositive({ message: 'O cycleId deve ser um número positivo.' })
  cycleId: number;
}
