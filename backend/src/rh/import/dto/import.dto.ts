import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class ImportDto {
    @ApiProperty({ type: 'number', description: 'ID do ciclo de avaliação ao qual os dados pertencem.' })
    @Type(() => Number) // Transforma a string do form-data em número
    @IsNumber()
    cycleId: number;

    @ApiProperty({ type: 'string', description: 'Objeto JSON em formato de string com as regras de De-Para.' })
    @IsString()
    dePara: string;
}