import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReferenceDto {
  @ApiProperty({ example: 2 })
  @IsInt()
  receiverId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  cycleId: number;

  @ApiProperty({
    example: 'Foi uma ótima experiência trabalhar com ela no projeto X.',
  })
  @IsString()
  justification: string;
}
