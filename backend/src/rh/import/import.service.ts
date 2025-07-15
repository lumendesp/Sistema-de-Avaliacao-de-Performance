import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import * as xlsx from 'xlsx';
import { CriterionName, Role, SelfEvaluation, User, MotivationLevel, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { encrypt } from '../../utils/encryption';
import * as JSZip from 'jszip';

type PrismaTransactionClient = Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

export interface FileProcessResult {
    status: 'success' | 'error';
    fileName: string;
    data?: any;
    reason?: string;
}

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
        'Gestão Organizacional*': 'GESTAO',
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

    private readonly motivationMapping: Record<string, MotivationLevel> = {
        'Concordo Totalmente': 'CONCORDO_TOTALMENTE',
        'Concordo Parcialmente': 'CONCORDO_PARCIALMENTE',
        'Discordo Parcialmente': 'DISCORDO_PARCIALMENTE',
        'Discordo Totalmente': 'DISCORDO_TOTALMENTE',
    };

    private readonly criterionToLevelMap: Record<string, number> = {
        'Organização': 1, 'Imagem': 1, 'Iniciativa': 1, 'Comprometimento': 1,
        'Flexibilidade': 1, 'Aprendizagem Contínua': 1, 'Trabalho em Equipe': 1,
        'Relacionamento Inter-Pessoal': 1, 'Produtividade': 1, 'Qualidade': 1,
        'Foco no Cliente': 1, 'Criatividade e Inovação': 1,
        'Gestão de Pessoas*': 2, 'Gestão de Projetos*': 2,
        'Gestão Organizacional*': 2, 'Novos Clientes**': 3,
        'Novos Projetos**': 3, 'Novos Produtos ou Serviços**': 3
    };

    private readonly levelToRolesMap: Record<number, Role[]> = {
        1: [Role.COLLABORATOR],
        2: [Role.COLLABORATOR, Role.MANAGER],
        3: [Role.COLLABORATOR, Role.MANAGER, Role.COMMITTEE],
    };

    private readonly levelToTrackNameMap: Record<number, string> = {
        1: 'Trilha do Colaborador',
        2: 'Trilha de Liderança',
        3: 'Trilha Executiva',
    };

    constructor(private readonly prisma: PrismaService) { }

    // --- FUNÇÃO PÚBLICA PARA O ZIP ---
    async importBulkHistory(zipFile: Express.Multer.File, cycleId: number) {
        if (!zipFile || !['application/zip', 'application/x-zip-compressed'].includes(zipFile.mimetype)) {
            throw new BadRequestException('Arquivo inválido. Por favor, envie um arquivo .zip.');
        }

        const zip = await JSZip.loadAsync(zipFile.buffer);
        const fileNames = Object.keys(zip.files).filter(name => !zip.files[name].dir && name.toLowerCase().endsWith('.xlsx'));

        if (fileNames.length === 0) {
            throw new BadRequestException('Nenhum arquivo .xlsx encontrado dentro do .zip.');
        }

        const results: FileProcessResult[] = [];
        for (const fileName of fileNames) {
            try {
                const fileBuffer = await zip.files[fileName].async('nodebuffer');
                // Chamamos a lógica de importação individual para cada arquivo
                const result = await this.processSingleFile(fileBuffer, fileName, cycleId);
                results.push({ status: 'success', fileName, data: result });
            } catch (error) {
                console.error(`Falha ao importar o arquivo ${fileName}:`, error.message);
                results.push({ status: 'error', fileName, reason: error.message });
            }
        }

        return {
            message: 'Importação em massa concluída.',
            totalFiles: fileNames.length,
            results,
        };
    }

    // --- FUNÇÃO PÚBLICA PARA UM ÚNICO ARQUIVO XLSX ---
    async importHistory(file: Express.Multer.File, cycleId: number) {
        if (!file) {
            throw new BadRequestException('Nenhum arquivo enviado.');
        }
        return this.processSingleFile(file.buffer, file.originalname, cycleId);
    }

    private async processSingleFile(fileBuffer: Buffer, fileName: string, cycleId: number) {
        // Inicia uma transação. Todas as operações dentro dela ou funcionam ou são revertidas.
        return this.prisma.$transaction(async (tx) => {
            // Valida o ciclo de avaliação
            const cycle = await tx.evaluationCycle.findUnique({ where: { id: cycleId } });
            if (!cycle) {
                throw new NotFoundException(`Ciclo com ID ${cycleId} não encontrado.`);
            }

            // Processa cada aba do Excel
            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

            // --- Processando a Aba "Autoavaliação" para decisão de cargos ---
            const autoAvaliacaoSheet = workbook.Sheets['Autoavaliação'];
            if (!autoAvaliacaoSheet) {
                throw new BadRequestException('Aba "Autoavaliação" não encontrada no arquivo.');
            }
            const autoAvaliacaoData: any[] = xlsx.utils.sheet_to_json(autoAvaliacaoSheet);
            const { roles: determinedRoles, trackName: determinedTrackName } = this._determineRolesAndTrackFromEvaluation(autoAvaliacaoData);

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

            //Salvando position, unit e track de acordo com o arquivo excel
            const positionName = 'Developer';
            const position = await tx.position.findFirst({ where: { name: positionName } });
            if (!position) throw new NotFoundException(`Posição "${positionName}" não encontrada.`);

            const unitName = userDataFromExcel['Unidade'];
            const unit = await tx.unit.findFirst({ where: { name: unitName } });
            if (!unit) throw new NotFoundException(`Unidade "${unitName}" não encontrada.`);

            const track = await tx.track.findFirst({ where: { name: determinedTrackName } });
            if (!track) throw new NotFoundException(`Trilha "${determinedTrackName}" não encontrada.`);

            // Lógica "Find or Create"
            let user: User;

            // Tenta encontrar o usuário que já existe
            const existingUser = await tx.user.findUnique({
                where: { email: userDataFromExcel['Email'] },
            });

            if (existingUser) {
                // Se encontrou, apenas atualiza o usuário
                console.log(`Usuário existente encontrado: ${existingUser.name} (ID: ${existingUser.id}).`);
                user = await tx.user.update({
                    where: { id: existingUser.id },
                    data: {
                        positionId: position.id,
                        unitId: unit.id,
                        trackId: track.id,
                        roles: {
                            deleteMany: {},
                            create: determinedRoles.map(role => ({ role })),
                        },
                    },
                });
            } else {
                // Se NÃO encontrou, SÓ ENTÃO executa a lógica de criação
                console.log(`Usuário com email ${userDataFromExcel['Email']} não encontrado. Criando novo usuário...`);

                const tempPassword = Math.random().toString(36).slice(-10);
                const hashedPassword = await bcrypt.hash(tempPassword, 10);

                //---Logica para criacao de username unico
                const baseUsername = userDataFromExcel['Email'].split('@')[0];
                let finalUsername = baseUsername;
                let counter = 2;
                // Verifica se o username já existe
                let usernameExists = await tx.user.findUnique({
                    where: { username: finalUsername },
                });
                // Se existir, entra em um loop para encontrar um nome disponível
                while (usernameExists) {
                    finalUsername = `${baseUsername}${counter}`;
                    usernameExists = await tx.user.findUnique({
                        where: { username: finalUsername },
                    });
                    counter++;
                }

                user = await tx.user.create({
                    data: {
                        email: userDataFromExcel['Email'],
                        name: this.formatUserNameFromSheet(userDataFromExcel['Nome ( nome.sobrenome )']),
                        username: finalUsername,
                        password: hashedPassword,
                        active: true,
                        position: { connect: { id: position.id } },
                        unit: { connect: { id: unit.id } },
                        track: { connect: { id: track.id } },
                        roles: { create: determinedRoles.map(role => ({ role })) },
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
                        justification: encrypt(combinedJustification),
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

            // --- Processando a Aba "Avaliação 360" ---
            const peerSheet = workbook.Sheets['Avaliação 360'];
            let peerEvaluationsImported = 0;

            if (peerSheet) {
                const peerData: any[] = xlsx.utils.sheet_to_json(peerSheet);

                for (const row of peerData) {
                    const evaluateeNameFromExcel = row['EMAIL DO AVALIADO ( nome.sobrenome )'];
                    if (!evaluateeNameFromExcel) continue;

                    // Encontra o usuário AVALIADO na linha
                    let evaluatee: User;
                    const formattedEvaluateeName = this.formatUserNameFromSheet(evaluateeNameFromExcel);
                    const existingEvaluatee = await tx.user.findFirst({ where: { name: formattedEvaluateeName } });

                    if (existingEvaluatee) {
                        evaluatee = existingEvaluatee;
                    } else {
                        // Se o avaliado não existe, cria um novo
                        console.warn(`Atenção: Colaborador avaliado "${formattedEvaluateeName}" não encontrado. Criando um novo registro...`);

                        const tempPassword = Math.random().toString(36).slice(-10);
                        const hashedPassword = await bcrypt.hash(tempPassword, 10);
                        const newEmail = `${evaluateeNameFromExcel.toLowerCase().replace('.', '_')}@example.com`;

                        const defaultTrackName = 'Trilha do Colaborador';
                        const defaultTrack = await tx.track.findFirst({ where: { name: defaultTrackName } });
                        if (!defaultTrack) throw new NotFoundException(`Trilha padrão "${defaultTrackName}" não encontrada.`);

                        evaluatee = await tx.user.create({
                            data: {
                                email: newEmail,
                                username: newEmail.split('@')[0],
                                name: formattedEvaluateeName,
                                password: hashedPassword,
                                active: true,
                                // Atribui o mesmo cargo/unidade/trilha do avaliador
                                positionId: user.positionId,
                                unitId: user.unitId,
                                trackId: defaultTrack.id,
                                roles: { create: [{ role: Role.COLLABORATOR }] },
                            }
                        });
                        console.log(`Novo usuário AVALIADO criado: ${evaluatee.name} (ID: ${evaluatee.id}).`);
                    }

                    const evaluatorId = user.id;
                    const evaluateeId = evaluatee.id;

                    // Previne autoavaliação 360
                    if (evaluatorId === evaluateeId) continue;

                    // Extrai, traduz e criptografa os dados da linha
                    const score = row['DÊ UMA NOTA GERAL PARA O COLABORADOR'];
                    if (typeof score !== 'number') continue;
                    const roundedScore = Math.round(score);

                    const strengths = row['PONTOS QUE FAZ BEM E DEVE EXPLORAR'] || '';
                    const improvements = row['PONTOS QUE DEVE MELHORAR'] || '';
                    const motivationText = row['VOCÊ FICARIA MOTIVADO EM TRABALHAR NOVAMENTE COM ESTE COLABORADOR'];
                    const motivation = this.motivationMapping[motivationText] || undefined;

                    const peerEvaluationData = {
                        score: roundedScore,
                        strengths: encrypt(strengths),
                        improvements: encrypt(improvements),
                        motivation: motivation,
                    };

                    // Verifica se a avaliação já existe para não duplicar
                    const existingPeerEval = await tx.peerEvaluation.findFirst({
                        where: { evaluatorId, evaluateeId, cycleId: cycle.id }
                    });

                    let savedPeerEvaluation;

                    if (existingPeerEval) {
                        console.log(`Avaliação de ${user.name} para ${evaluatee.name} já existe. Atualizando.`);
                        savedPeerEvaluation = await tx.peerEvaluation.update({
                            where: { id: existingPeerEval.id },
                            data: peerEvaluationData,
                        });
                    } else {
                        // Se não existe, CRIA
                        savedPeerEvaluation = await tx.peerEvaluation.create({
                            data: {
                                ...peerEvaluationData,
                                evaluatorId: evaluatorId,
                                evaluateeId: evaluateeId,
                                cycleId: cycle.id,
                            }
                        });
                    }
                    peerEvaluationsImported++;


                    // Lida com os projetos
                    const projectName = row['PROJETO EM QUE ATUARAM JUNTOS - OBRIGATÓRIO TEREM ATUADOS JUNTOS'];
                    const period = row['PERÍODO'];
                    const periodAsNumber = parseInt(period, 10);

                    if (projectName && !isNaN(periodAsNumber)) {
                        await tx.peerEvaluationProject.deleteMany({ where: { peerEvaluationId: savedPeerEvaluation.id } });

                        const project = await tx.project.upsert({
                            where: { name: projectName },
                            create: { name: projectName },
                            update: {}
                        });
                        await tx.peerEvaluationProject.create({
                            data: {
                                peerEvaluationId: savedPeerEvaluation.id,
                                projectId: project.id,
                                period: periodAsNumber
                            }
                        });
                    } else {
                        console.warn('AVISO: Projeto ou período inválido. A conexão com o projeto foi ignorada para esta avaliação.');
                    }
                }
            }

            // --- Processando a Aba "Pesquisa de Referências" ---
            const referenceSheet = workbook.Sheets['Pesquisa de Referências'];
            let referencesProcessed = 0;

            if (referenceSheet) {
                const referenceData: any[] = xlsx.utils.sheet_to_json(referenceSheet);

                for (const row of referenceData) {
                    const receiverNameFromExcel = row['EMAIL DA REFERÊNCIA\n( nome.sobrenome )'];
                    const justification = row['JUSTIFICATIVA'] || '';

                    if (!receiverNameFromExcel) continue;

                    // Lógica de "Find or Create" para a pessoa referenciada
                    let receiver: User;
                    const formattedReceiverName = this.formatUserNameFromSheet(receiverNameFromExcel);
                    const existingReceiver = await tx.user.findFirst({ where: { name: formattedReceiverName } });

                    if (existingReceiver) {
                        receiver = existingReceiver;
                    } else {
                        // Se a referência não existe como usuário, cria um novo
                        console.warn(`Atenção: Referência "${formattedReceiverName}" não encontrada. Criando um novo registro...`);

                        const tempPassword = Math.random().toString(36).slice(-10);
                        const hashedPassword = await bcrypt.hash(tempPassword, 10);
                        const newEmail = `${receiverNameFromExcel.toLowerCase().replace('.', '_')}@example.com`;

                        const defaultTrackName = 'Trilha do Colaborador';
                        const defaultTrack = await tx.track.findFirst({ where: { name: defaultTrackName } });
                        if (!defaultTrack) throw new NotFoundException(`Trilha padrão "${defaultTrackName}" não encontrada.`);

                        receiver = await tx.user.create({
                            data: {
                                email: newEmail,
                                username: newEmail.split('@')[0],
                                name: formattedReceiverName,
                                password: hashedPassword,
                                active: true,
                                positionId: user.positionId,
                                unitId: user.unitId,
                                trackId: defaultTrack.id,
                                roles: { create: [{ role: Role.COLLABORATOR }] },
                            }
                        });
                    }

                    // Previne que alguém se auto-referencie
                    if (user.id === receiver.id) continue;

                    // Atualiza ou cria o registro de referência
                    const existingReference = await tx.reference.findFirst({
                        where: {
                            providerId: user.id,
                            receiverId: receiver.id,
                            cycleId: cycle.id,
                        }
                    });

                    if (existingReference) {
                        // Se existe, ATUALIZA a justificativa
                        await tx.reference.update({
                            where: { id: existingReference.id },
                            data: { justification: encrypt(justification) },
                        });
                    } else {
                        // Se não existe, CRIA a nova referência
                        await tx.reference.create({
                            data: {
                                providerId: user.id,
                                receiverId: receiver.id,
                                cycleId: cycle.id,
                                justification: encrypt(justification),
                            }
                        });
                    }
                    referencesProcessed++;
                }
            }

            return {
                userName: user.name,
                message: `Histórico de ${user.name} importado e ${existingEvaluation ? 'ATUALIZADO' : 'CRIADO'} com sucesso!`,
                selfEvaluationItemsProcessed: groupedData.size,
                peerEvaluationsImported,
                referencesProcessed,
            };
        });
    }

    // --- FUNÇÃO PRIVADA PARA DETERMINAR AS ROLES E AS TRACKS ---
    private _determineRolesAndTrackFromEvaluation(evaluationData: any[]) {
        let maxLevel = 0;
        for (const row of evaluationData) {
            const score = row['AUTO-AVALIAÇÃO'];
            const oldCriterionName = row['CRITÉRIO'];
            if (oldCriterionName && typeof score === 'number') {
                const level = this.criterionToLevelMap[oldCriterionName];
                if (level > maxLevel) {
                    maxLevel = level;
                }
            }
        }

        const roles = this.levelToRolesMap[maxLevel];
        const trackName = this.levelToTrackNameMap[maxLevel];

        return { roles, trackName };
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