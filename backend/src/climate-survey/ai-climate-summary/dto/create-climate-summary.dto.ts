import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class CreateClimateSummaryDto {
  @ApiProperty({
    description: 'ID da pesquisa de clima organizacional',
    example: 5,
  })
  @IsInt()
  @IsPositive()
  surveyId: number;
}
