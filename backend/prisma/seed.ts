import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Cria posições
  const position1 = await prisma.position.create({ data: { name: 'Developer' } });
  const position2 = await prisma.position.create({ data: { name: 'Manager' } });

  // Cria unidades
  const unit1 = await prisma.unit.create({ data: { name: 'Engineering' } });
  const unit2 = await prisma.unit.create({ data: { name: 'HR' } });

  // Cria trilhas
  const track1 = await prisma.track.create({ data: { name: 'Backend' } });
  const track2 = await prisma.track.create({ data: { name: 'Frontend' } });
  const track3 = await prisma.track.create({ data: { name: 'Trilha de Liderança' } });

  // Adicionando todos os tipos de criterios no bd
  const criteriaData: Array<{ name: string; displayName: string; generalDescription: string; weight: number }> = [
    { name: 'ORGANIZACAO_NO_TRABALHO', displayName: 'Organização no Trabalho', generalDescription: 'Capacidade de manter o ambiente organizado', weight: 10 },
    { name: 'ATENDER_AOS_PRAZOS', displayName: 'Atender aos Prazos', generalDescription: 'Capacidade de cumprir prazos estabelecidos', weight: 10 },
    { name: 'SENTIMENTO_DE_DONO', displayName: 'Sentimento de Dono', generalDescription: 'Demonstra responsabilidade e compromisso com os resultados', weight: 10 },
    { name: 'RESILIENCIA_NAS_ADVERSIDADES', displayName: 'Resiliência nas Adversidades', generalDescription: 'Capacidade de se adaptar e superar desafios', weight: 10 },
    { name: 'CAPACIDADE_DE_APRENDER', displayName: 'Capacidade de Aprender', generalDescription: 'Disposição para aprender e se desenvolver continuamente', weight: 10 },
    { name: 'TEAM_PLAYER', displayName: 'Team Player', generalDescription: 'Capacidade de trabalhar em equipe e colaborar', weight: 10 },
    { name: 'FAZER_MAIS_COM_MENOS', displayName: 'Fazer Mais com Menos', generalDescription: 'Eficiência na utilização de recursos', weight: 10 },
    { name: 'ENTREGAR_COM_QUALIDADE', displayName: 'Entregar com Qualidade', generalDescription: 'Compromisso com a qualidade das entregas', weight: 10 },
    { name: 'PENSAR_FORA_DA_CAIXA', displayName: 'Pensar Fora da Caixa', generalDescription: 'Criatividade e inovação na resolução de problemas', weight: 10 },
    { name: 'GENTE', displayName: 'Gente', generalDescription: 'Habilidades de relacionamento e liderança', weight: 10 },
    { name: 'RESULTADOS', displayName: 'Resultados', generalDescription: 'Foco em resultados e performance', weight: 10 },
    { name: 'EVOLUCAO_DA_ROCKET_COR', displayName: 'Evolução da Rocket Cor', generalDescription: 'Contribuição para o crescimento da empresa', weight: 10 },
  ];

  const criteria: any[] = [];
  for (const criterionData of criteriaData) {
    const existing = await prisma.criterion.findFirst({
      where: { name: criterionData.name as any }
    });
    
    if (!existing) {
      const criterion = await prisma.criterion.create({
        data: {
          name: criterionData.name as any,
          displayName: criterionData.displayName,
          generalDescription: criterionData.generalDescription,
          weight: criterionData.weight
        }
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
      criterionId: criteria.find(c => c.name === 'ORGANIZACAO_NO_TRABALHO')?.id,
      groupId: backendGroup1.id,
      trackId: track1.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(c => c.name === 'TEAM_PLAYER')?.id,
      groupId: backendGroup2.id,
      trackId: track1.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(c => c.name === 'ENTREGAR_COM_QUALIDADE')?.id,
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
      criterionId: criteria.find(c => c.name === 'ORGANIZACAO_NO_TRABALHO')?.id,
      groupId: frontendGroup1.id,
      trackId: track2.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(c => c.name === 'SENTIMENTO_DE_DONO')?.id,
      groupId: frontendGroup1.id,
      trackId: track2.id,
      unitId: unit1.id,
      positionId: position1.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(c => c.name === 'TEAM_PLAYER')?.id,
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
      criterionId: criteria.find(c => c.name === 'GENTE')?.id,
      groupId: leadershipGroup1.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(c => c.name === 'RESULTADOS')?.id,
      groupId: leadershipGroup1.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(c => c.name === 'TEAM_PLAYER')?.id,
      groupId: leadershipGroup2.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(c => c.name === 'SENTIMENTO_DE_DONO')?.id,
      groupId: leadershipGroup2.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(c => c.name === 'EVOLUCAO_DA_ROCKET_COR')?.id,
      groupId: leadershipGroup3.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: true,
    },
    {
      criterionId: criteria.find(c => c.name === 'FAZER_MAIS_COM_MENOS')?.id,
      groupId: leadershipGroup3.id,
      trackId: track3.id,
      unitId: unit1.id,
      positionId: position2.id,
      mandatory: false,
    },
  ];

  const allConfigs = [...backendConfigs, ...frontendConfigs, ...leadershipConfigs];
  for (const config of allConfigs) {
    if (config.criterionId) {
      await prisma.configuredCriterion.create({
        data: config
      });
    }
  }

  // Hash simples para senha (exemplo)
  const passwordHash1 = await bcrypt.hash('password123', 10);
  const passwordHash2 = await bcrypt.hash('adminpass', 10);
  const passwordHash3 = await bcrypt.hash('comite123', 10);

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
        create: [{ role: 'MANAGER' }, { role: 'ADMIN' }, { role: 'COMMITTEE' }],
      },
    },
  });

  // Cria usuário do comitê
  const user3 = await prisma.user.create({
    data: {
      name: 'Carlos Nogueira',
      username: 'carlos.n',
      email: 'carlos@rocketcorp.com',
      password: passwordHash3,
      active: true,
      positionId: position2.id,
      unitId: unit1.id,
      trackId: track3.id,
      roles: {
        create: [{ role: 'COMMITTEE' }, { role: 'COLLABORATOR' }],
      },
    },
  });

  // Cria ciclo
  await prisma.evaluationCycle.create({
    data: {
      name: '2025 Mid-Year Cycle',
      startDate: new Date('2025-06-01T00:00:00Z'),
      endDate: new Date('2025-07-31T23:59:59Z'),
      status: 'IN_PROGRESS',
    },
  });

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

  console.log('✅ Seed com critérios relacionados executada com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
