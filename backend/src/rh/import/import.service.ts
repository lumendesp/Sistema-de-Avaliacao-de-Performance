import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as xlsx from 'xlsx';
import { CriterionName, Role, SelfEvaluation, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ImportService {

    private readonly criteriaMapping: Record<string, CriterionName> = {
        'Organização': 'ORGANIZACAO_NO_TRABALHO',
        'Imagem': 'ATENDER_AOS_PRAZOS',
        'Iniciativa': 'SENTIMENTO_DE_DONO',
        'Comprometimento': 'RESILIENCIA_NAS_ADVERSIDADES',
        'Flexibilidade': 'RESILIENCIA_NAS_ADVERSIDADES',
        'Aprendizagem Contínua': 'CAPACIDADE_DE_APRENDER',
        'Trabalho em Equipe': 'TEAM_PLAYER',
        'Relacionamento Inter-Pessoal': 'TEAM_PLAYER',
        'Produtividade': 'FAZER_MAIS_COM_MENOS',
        'Qualidade': 'ENTREGAR_COM_QUALIDADE',
        'Foco no Cliente': 'ENTREGAR_COM_QUALIDADE',
        'Criatividade e Inovação': 'PENSAR_FORA_DA_CAIXA',
        'Gestão de Pessoas*': 'GENTE',
        'Gestão de Projetos*': 'RESULTADOS',
        'Gestão Organizacional*': 'EVOLUCAO_DA_ROCKET_COR',
        'Novos Clientes**': 'EVOLUCAO_DA_ROCKET_COR',
        'Novos Projetos**': 'EVOLUCAO_DA_ROCKET_COR',
        'Novos Produtos ou Serviços**': 'EVOLUCAO_DA_ROCKET_COR'
    };

    private readonly scoreDescriptionMap: Record<number, string> = {
        5: 'Supera as expectativas',
        4: 'Fica acima das expectativas',
        3: 'Atinge as expectativas',
        2: 'Fica abaixo das expectativas',
        1: 'Fica muito abaixo das expectativas'
    };

    constructor(private readonly prisma: PrismaService) { }

    async importHistory(
        file: Express.Multer.File,
        cycleId: number,
    ) {
        if (!file) {
            throw new BadRequestException('Nenhum arquivo enviado.');
        }

        // Inicia uma transação. Todas as operações dentro dela ou funcionam ou são revertidas.
        return this.prisma.$transaction(async (tx) => {
            // 2. Valida o ciclo de avaliação
            const cycle = await tx.evaluationCycle.findUnique({ where: { id: cycleId } });
            if (!cycle) {
                throw new NotFoundException(`Ciclo com ID ${cycleId} não encontrado.`);
            }

            // Processa cada aba do Excel (começando pela Autoavaliação)
            const workbook = xlsx.read(file.buffer, { type: 'buffer' });

            // Lendo a aba "Perfil" para pegar todos os dados do usuário
            const perfilSheet = workbook.Sheets['Perfil'];
            if (!perfilSheet) {
                throw new BadRequestException('Aba "Perfil" não encontrada no arquivo.');
            }
            const perfilData: any[] = xlsx.utils.sheet_to_json(perfilSheet);
            const userDataFromExcel = perfilData[0];

            if (!userDataFromExcel || !userDataFromExcel['Email']) {
                throw new BadRequestException('Dados de perfil ou Email não encontrados no arquivo.');
            }

            // Lógica "Find or Create" (Upsert)
            let user: User;

            // Tenta encontrar o usuário que já existe
            const existingUser = await tx.user.findUnique({
                where: { email: userDataFromExcel['Email'] },
            });

            if (existingUser) {
                // Se encontrou, apenas usa o usuário existente
                user = existingUser;
                console.log(`Usuário existente encontrado: ${user.name} (ID: ${user.id}).`);
            } else {
                // Se NÃO encontrou, SÓ ENTÃO executa a lógica de criação
                console.log(`Usuário com email ${userDataFromExcel['Email']} não encontrado. Criando novo usuário...`);

                const tempPassword = Math.random().toString(36).slice(-10);
                const hashedPassword = await bcrypt.hash(tempPassword, 10);

                const positionName = userDataFromExcel['CARGO'] || 'Developer';
                const position = await tx.position.findFirst({ where: { name: positionName } });
                if (!position) throw new NotFoundException(`Posição "${positionName}" não encontrada.`);

                const unitName = userDataFromExcel['UNIDADE'] || 'Recife';
                const unit = await tx.unit.findFirst({ where: { name: unitName } });
                if (!unit) throw new NotFoundException(`Unidade "${unitName}" não encontrada.`);

                const trackName = userDataFromExcel['TRILHA'] || 'Backend';
                const track = await tx.track.findFirst({ where: { name: trackName } });
                if (!track) throw new NotFoundException(`Trilha "${trackName}" não encontrada.`);

                user = await tx.user.create({
                    data: {
                        email: userDataFromExcel['Email'],
                        name: this.formatUserNameFromSheet(userDataFromExcel['Nome ( nome.sobrenome )']),
                        username: userDataFromExcel['Email'].split('@')[0],
                        password: hashedPassword,
                        active: true,
                        position: { connect: { id: position.id } },
                        unit: { connect: { id: unit.id } },
                        track: { connect: { id: track.id } },
                        roles: { create: [{ role: Role.COLLABORATOR }] },
                    },
                });

                console.log(`Novo usuário criado: ${user.name} (ID: ${user.id}). Senha temporária: ${tempPassword}`);
            }

            let selfEvaluation: SelfEvaluation;
            const existingEvaluation = await tx.selfEvaluation.findFirst({
                where: { userId: user.id, cycleId: cycle.id },
            });

            if (existingEvaluation) {
                console.log(`Avaliação existente encontrada (ID: ${existingEvaluation.id}). Apagando itens antigos para atualização...`);
                // Se já existe, apaga TODOS os itens antigos para substituí-los.
                await tx.selfEvaluationItem.deleteMany({
                    where: { evaluationId: existingEvaluation.id },
                });
                selfEvaluation = existingEvaluation; // Usaremos esta avaliação para os novos itens.
            } else {
                console.log(`Nenhuma avaliação existente para ${user.name} neste ciclo. Criando uma nova...`);
                // Se não existe, cria um novo registro de autoavaliação.
                selfEvaluation = await tx.selfEvaluation.create({
                    data: { userId: user.id, cycleId: cycle.id },
                });
            }

            // --- Processando a Aba "Autoavaliação" ---
            const autoAvaliacaoSheet = workbook.Sheets['Autoavaliação'];
            if (!autoAvaliacaoSheet) {
                throw new BadRequestException('Aba "Autoavaliação" não encontrada no arquivo.');
            }
            const autoAvaliacaoData: any[] = xlsx.utils.sheet_to_json(autoAvaliacaoSheet);

            // Agrupar os dados pelo NOVO critério
            const groupedData = new Map<CriterionName, { scores: number[]; justifications: string[] }>();

            for (const row of autoAvaliacaoData) {
                const oldCriterionName = row['CRITÉRIO'];
                const score = row['AUTO-AVALIAÇÃO'];
                const justification = row['DADOS E FATOS DA AUTO-AVALIAÇÃO\nCITE, DE FORMA OBJETIVA, CASOS E SITUAÇÕES REAIS'] || '';

                if (!oldCriterionName || typeof score !== 'number') continue;

                // Traduz o nome antigo para o novo usando o mapa
                const newCriterionName = this.criteriaMapping[oldCriterionName];
                if (!newCriterionName) {
                    throw new BadRequestException(`Critério "${oldCriterionName}" não tem mapeamento definido.`);
                }

                // Se o novo critério ainda não está no mapa, inicializa
                if (!groupedData.has(newCriterionName)) {
                    groupedData.set(newCriterionName, { scores: [], justifications: [] });
                }

                // Adiciona a nota e a justificativa ao grupo correto
                const group = groupedData.get(newCriterionName)!;
                group.scores.push(score);
                group.justifications.push(justification);
            }

            const allAverageScores: number[] = [];

            for (const [criterionName, data] of groupedData.entries()) {
                // Busca o ID do critério no banco
                const criterion = await tx.criterion.findFirst({ where: { name: criterionName } });
                if (!criterion) {
                    throw new NotFoundException(`Critério do sistema "${criterionName}" não encontrado no banco.`);
                }

                // Calcula a média das notas e arredonda
                const averageScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);

                // Junta as justificativas
                const combinedJustification = data.justifications.filter(j => j.trim() !== '').join('\n\n---\n\n');

                const scoreDescription = this.scoreDescriptionMap[averageScore] || null;

                // Guardamos a nota média de cada critério
                allAverageScores.push(averageScore);

                // Cria um ÚNICO item de avaliação para o critério agrupado
                await tx.selfEvaluationItem.create({
                    data: {
                        evaluationId: selfEvaluation.id,
                        criterionId: criterion.id,
                        score: averageScore,
                        justification: combinedJustification,
                        scoreDescription: scoreDescription,
                    },
                });
            }

            // Calculamos a média geral e atualizamos o registro
            if (allAverageScores.length > 0) {
                const overallAverage = allAverageScores.reduce((a, b) => a + b, 0) / allAverageScores.length;
                await tx.selfEvaluation.update({
                    where: { id: selfEvaluation.id },
                    data: {
                        averageScore: parseFloat(overallAverage.toFixed(1)), // Salva a média com 1 casa decimal
                    },
                });
            }

            return {
                message: `Histórico de ${user.name} importado e ${existingEvaluation ? 'ATUALIZADO' : 'CRIADO'} com sucesso!`,
                criteriaProcessed: groupedData.size,
            };
        });
    }

    // Transforma "nome.sobrenome" em "Nome Sobrenome"
    private formatUserNameFromSheet(rawName: string): string {
        if (!rawName || typeof rawName !== 'string') return '';

        return rawName
            .split('.') // Divide a string em ["nome", "sobrenome"]
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza cada parte
            .join(' '); // Junta com um espaço
    }
}