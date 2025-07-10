import { PrismaClient, CriterionName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Cria posições
  const position1 = await prisma.position.create({
    data: { name: 'Developer' },
  });
  const position2 = await prisma.position.create({ data: { name: 'Manager' } });

  // Cria unidades
  const unit1 = await prisma.unit.create({ data: { name: 'Rio de Janeiro' } });
  const unit2 = await prisma.unit.create({ data: { name: 'Recife' } });

  // Cria trilhas
  const track1 = await prisma.track.create({ data: { name: 'Backend' } });
  const track2 = await prisma.track.create({ data: { name: 'Frontend' } });
  const track3 = await prisma.track.create({
    data: { name: 'Trilha de Liderança' },
  });

  // Adicionando todos os tipos de criterios no bd
  const criteriaData: Array<{
    name: CriterionName;
    generalDescription: string;
    weight: number;
  }> = [
    {
      name: CriterionName.ORGANIZACAO_NO_TRABALHO,
      generalDescription: 'Capacidade de manter o ambiente organizado',
      weight: 10,
    },
    {
      name: CriterionName.ATENDER_AOS_PRAZOS,
      generalDescription: 'Capacidade de cumprir prazos estabelecidos',
      weight: 10,
    },
    {
      name: CriterionName.SENTIMENTO_DE_DONO,
      generalDescription:
        'Demonstra responsabilidade e compromisso com os resultados',
      weight: 10,
    },
    {
      name: CriterionName.RESILIENCIA_NAS_ADVERSIDADES,
      generalDescription: 'Capacidade de se adaptar e superar desafios',
      weight: 10,
    },
    {
      name: CriterionName.CAPACIDADE_DE_APRENDER,
      generalDescription:
        'Disposição para aprender e se desenvolver continuamente',
      weight: 10,
    },
    {
      name: CriterionName.TEAM_PLAYER,
      generalDescription: 'Capacidade de trabalhar em equipe e colaborar',
      weight: 10,
    },
    {
      name: CriterionName.FAZER_MAIS_COM_MENOS,
      generalDescription: 'Eficiência na utilização de recursos',
      weight: 10,
    },
    {
      name: CriterionName.ENTREGAR_COM_QUALIDADE,
      generalDescription: 'Compromisso com a qualidade das entregas',
      weight: 10,
    },
    {
      name: CriterionName.PENSAR_FORA_DA_CAIXA,
      generalDescription: 'Criatividade e inovação na resolução de problemas',
      weight: 10,
    },
    {
      name: CriterionName.GENTE,
      generalDescription: 'Habilidades de relacionamento e liderança',
      weight: 10,
    },
    {
      name: CriterionName.RESULTADOS,
      generalDescription: 'Foco em resultados e performance',
      weight: 10,
    },
    {
      name: CriterionName.EVOLUCAO_DA_ROCKET_COR,
      generalDescription: 'Contribuição para o crescimento da empresa',
      weight: 10,
    },
  ];

  const criteria: any[] = [];
  for (const criterionData of criteriaData) {
    const existing = await prisma.criterion.findFirst({
      where: { name: criterionData.name },
    });

    if (!existing) {
      const criterion = await prisma.criterion.create({
        data: criterionData,
      });
      criteria.push(criterion);
    } else {
      criteria.push(existing);
    }
  }

  // Criando os grupos de criterios para Backend
  const backendGroup1 = await prisma.criterionGroup.create({
    data: {
      name: 'Comportamento',
      trackId: track1.id,
      unitId: unit1.id,
      positionId: position1.id,
    },
  });

  const backendGroup2 = await prisma.criterionGroup.create({
    data: {
      name: 'Relacionamento',
      trackId: track1.id,
      unitId: unit1.id,
      positionId: position1.id,
    },
  });

  // Criando os grupos de criterios para Frontend
  const frontendGroup1 = await prisma.criterionGroup.create({
    data: {
      name: 'Comportamento',
      trackId: track2.id,
      unitId: unit1.id,
      positionId: position1.id,
    },
  });

  const frontendGroup2 = await prisma.criterionGroup.create({
    data: {
      name: 'Relacionamento',
      trackId: track2.id,
      unitId: unit1.id,
      positionId: position1.id,
    },
  });

  // Criando os grupos de criterios para Trilha de Liderança
  const leadershipGroup1 = await prisma.criterionGroup.create({
    data: {
      name: 'Liderança Técnica',
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
    },
  });

  const leadershipGroup2 = await prisma.criterionGroup.create({
    data: {
      name: 'Gestão de Pessoas',
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
    },
  });

  const leadershipGroup3 = await prisma.criterionGroup.create({
    data: {
      name: 'Resultados e Performance',
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
    },
  });

  // Criação das configuração de criterios para Backend
  const backendConfigs = [
    {
      criterionId: criteria.find(
        (c) => c.name === CriterionName.ORGANIZACAO_NO_TRABALHO,
      )?.id,
      groupId: backendGroup1.id,
      trackId: track1.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find((c) => c.name === CriterionName.TEAM_PLAYER)
        ?.id,
      groupId: backendGroup2.id,
      trackId: track1.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(
        (c) => c.name === CriterionName.ENTREGAR_COM_QUALIDADE,
      )?.id,
      groupId: backendGroup2.id,
      trackId: track1.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: false,
    },
  ];

  // Criação das configuração de criterios para Frontend
  const frontendConfigs = [
    {
      criterionId: criteria.find(
        (c) => c.name === CriterionName.ORGANIZACAO_NO_TRABALHO,
      )?.id,
      groupId: frontendGroup1.id,
      trackId: track2.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(
        (c) => c.name === CriterionName.SENTIMENTO_DE_DONO,
      )?.id,
      groupId: frontendGroup1.id,
      trackId: track2.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find((c) => c.name === CriterionName.TEAM_PLAYER)
        ?.id,
      groupId: frontendGroup2.id,
      trackId: track2.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: true,
    },
  ];

  // Criação das configuração de criterios para Trilha de Liderança
  const leadershipConfigs = [
    {
      criterionId: criteria.find((c) => c.name === CriterionName.GENTE)?.id,
      groupId: leadershipGroup1.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find((c) => c.name === CriterionName.RESULTADOS)
        ?.id,
      groupId: leadershipGroup1.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find((c) => c.name === CriterionName.TEAM_PLAYER)
        ?.id,
      groupId: leadershipGroup2.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(
        (c) => c.name === CriterionName.SENTIMENTO_DE_DONO,
      )?.id,
      groupId: leadershipGroup2.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(
        (c) => c.name === CriterionName.EVOLUCAO_DA_ROCKET_COR,
      )?.id,
      groupId: leadershipGroup3.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(
        (c) => c.name === CriterionName.FAZER_MAIS_COM_MENOS,
      )?.id,
      groupId: leadershipGroup3.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: false,
    },
  ];

  const allConfigs = [
    ...backendConfigs,
    ...frontendConfigs,
    ...leadershipConfigs,
  ];
  for (const config of allConfigs) {
    if (config.criterionId) {
      await prisma.configuredCriterion.create({
        data: config,
      });
    }
  }

  // Hash simples para senha (exemplo)
  const passwordHash1 = await bcrypt.hash('password123', 10);
  const passwordHash2 = await bcrypt.hash('adminpass', 10);

  // Cria usuários
  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      username: 'alice.j',
      email: 'alice@example.com',
      password: passwordHash1,
      active: true,
      positionId: position1.id,
      unitId: unit1.id,
      trackId: track1.id,
      roles: {
        create: [{ role: 'COLLABORATOR' }],
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Manager',
      username: 'bob.m',
      email: 'bob@example.com',
      password: passwordHash2,
      active: true,
      positionId: position2.id,
      unitId: unit2.id,
      trackId: track2.id,
      roles: {
        create: [
          { role: 'MANAGER' },
          { role: 'COLLABORATOR' },
          { role: 'ADMIN' },
        ],
      },
    },
  });

  // Relacionar Alice como colaboradora gerenciada por Bob
  await prisma.managerCollaborator.create({
    data: {
      managerId: user2.id, // Bob
      collaboratorId: user1.id, // Alice
    },
  });

  // Criação dos 4 novos usuários
  const passwordHash3 = await bcrypt.hash('password123', 10);
  const passwordHash4 = await bcrypt.hash('password123', 10);
  const passwordHash5 = await bcrypt.hash('password123', 10);
  const passwordHash6 = await bcrypt.hash('password123', 10);

  // Usuário 3: COLLABORATOR, MANAGER, MENTOR
  const user3 = await prisma.user.create({
    data: {
      name: 'Carlos Silva',
      username: 'carlos.s',
      email: 'carlos@example.com',
      password: passwordHash3,
      active: true,
      positionId: position1.id,
      unitId: unit1.id,
      trackId: track1.id,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'MANAGER' },
          { role: 'MENTOR' },
        ],
      },
    },
  });

  // Usuário 4: COLLABORATOR, COMMITTEE, HR
  const user4 = await prisma.user.create({
    data: {
      name: 'Diana Santos',
      username: 'diana.s',
      email: 'diana@example.com',
      password: passwordHash4,
      active: true,
      positionId: position1.id,
      unitId: unit1.id,
      trackId: track1.id,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'COMMITTEE' },
          { role: 'HR' },
        ],
      },
    },
  });

  // Usuário 5: MANAGER, COMMITTEE, HR
  const user5 = await prisma.user.create({
    data: {
      name: 'Eduardo Costa',
      username: 'eduardo.c',
      email: 'eduardo@example.com',
      password: passwordHash5,
      active: true,
      positionId: position2.id,
      unitId: unit2.id,
      trackId: track3.id,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'COMMITTEE' },
          { role: 'HR' }
        ],
      },
    },
  });

  // Usuário 6: ADMIN
  const user6 = await prisma.user.create({
    data: {
      name: 'Fernanda Lima',
      username: 'fernanda.l',
      email: 'fernanda@example.com',
      password: passwordHash6,
      active: true,
      positionId: position2.id,
      unitId: unit2.id,
      trackId: track3.id,
      roles: {
        create: [
          { role: 'ADMIN' },
        ],
      },
    },
  });

  // Relacionamentos adicionais (opcional)
  // Carlos gerencia Diana
  await prisma.managerCollaborator.create({
    data: {
      managerId: user3.id, // Carlos
      collaboratorId: user4.id, // Diana
    },
  });

  // Eduardo gerencia Carlos
  await prisma.managerCollaborator.create({
    data: {
      managerId: user5.id, // Eduardo
      collaboratorId: user3.id, // Carlos
    },
  });

  // Criar ciclo de colaboradores (único ciclo inicial)
  const cycleCollaborators = await prisma.evaluationCycle.create({
    data: {
      name: '2025.1',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias à frente
      status: 'IN_PROGRESS',
      type: 'COLLABORATOR',
    },
  });

  // Remover criação dos ciclos de manager e RH/Comitê
  // const cycleManagers = await prisma.evaluationCycle.create({ ... });
  // const cycleRHCommittee = await prisma.evaluationCycle.create({ ... });

  // Cria alguns projetos para peer evaluation
  const projectsData = [
    {
      name: 'Project Apollo',
      description: 'Sistema de automação para controle de produção',
    },
    {
      name: 'Project Orion',
      description: 'Aplicação web para gerenciamento de equipes',
    },
    {
      name: 'Project Vega',
      description: 'Ferramenta de análise de dados para marketing',
    },
  ];

  for (const proj of projectsData) {
    await prisma.project.create({
      data: proj,
    });
  }

  console.log('Seed completed!');
  console.log('Cycle ID criado:', cycleCollaborators.id);
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });