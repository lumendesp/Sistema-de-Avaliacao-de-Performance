// src/rh/dashboard/dto/rh-collaborator.dto.ts
import { ApiProperty } from '@nestjs/swagger';

// Este DTO representa um único colaborador na lista
export class RhCollaboratorDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    role: string;

    @ApiProperty()
    avatarInitials: string;

    @ApiProperty({ example: 'Tecnologia' })
    unit: string;

    @ApiProperty({ enum: ['finalizado', 'pendente', 'em_andamento'] })
    status: 'finalizado' | 'pendente' | 'em_andamento';

    @ApiProperty({ required: false })
    autoAvaliacao?: number;

    @ApiProperty({ required: false })
    avaliacao360?: number;

    @ApiProperty({ required: false })
    notaGestor?: number;

    @ApiProperty({ required: false, nullable: true })
    notaFinal?: number | null;
}