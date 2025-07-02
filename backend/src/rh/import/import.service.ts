import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as xlsx from 'xlsx';

@Injectable()
export class ImportService {
    // Injetamos apenas o PrismaService
    constructor(private readonly prisma: PrismaService) { }

    async importHistory(file: Express.Multer.File, cycleId: number, deParaRules: Record<string, string>) {
        if (!file) {
            throw new BadRequestException('Nenhum arquivo enviado.');
        }

        // Usamos o prisma diretamente para encontrar o ciclo
        const cycle = await this.prisma.evaluationCycle.findUnique({ where: { id: cycleId } });
        if (!cycle) {
            throw new NotFoundException(`Ciclo com ID ${cycleId} não encontrado.`);
        }

        const workbook = xlsx.read(file.buffer, { type: 'buffer' });

        // Exemplo: Lendo a aba de Autoavaliação
        const autoAvaliacaoSheetName = 'Autoavaliação';
        const autoAvaliacaoSheet = workbook.Sheets[autoAvaliacaoSheetName];
        if (!autoAvaliacaoSheet) {
            throw new BadRequestException(`Aba "${autoAvaliacaoSheetName}" não encontrada no arquivo.`);
        }

        const autoAvaliacaoData = xlsx.utils.sheet_to_json(autoAvaliacaoSheet);

        // A lógica de processamento complexa viria aqui.
        // Envolveríamos tudo em uma transação do Prisma para garantir a integridade:
        // await this.prisma.$transaction(async (tx) => {
        //   1. Ler o nome do usuário do Excel.
        //   2. Buscar o usuário no banco: `tx.user.findUnique(...)`
        //   3. Ler os critérios e notas do Excel.
        //   4. Usar as `deParaRules` para mapear os nomes para os critérios do banco.
        //   5. Criar `SelfEvaluation` e `SelfEvaluationItem` com os dados.
        //   6. Repetir para outras abas...
        // });

        // Por enquanto, retornamos um sucesso para confirmar que o arquivo foi lido.
        return {
            message: 'Arquivo recebido! A lógica de processamento está pronta para ser detalhada.',
            fileName: file.originalname,
            cycleId: cycle.id,
            totalRowsFound: autoAvaliacaoData.length,
            dataPreview: autoAvaliacaoData.slice(0, 2),
        };
    }
}