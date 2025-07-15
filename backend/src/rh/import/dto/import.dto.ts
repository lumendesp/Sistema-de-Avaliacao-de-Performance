import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ImportDto {
    @ApiProperty({ type: 'number', description: 'ID do ciclo de avaliação ao qual os dados pertencem.' })
    @Type(() => Number)
    @IsNumber()
    cycleId: number;
}