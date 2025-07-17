import { PrismaClient, CriterionName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Cria posições
  const position1 = await prisma.position.create({ data: { name: 'Developer' } });
  const position2 = await prisma.position.create({ data: { name: 'Manager' } });

  // Cria unidades
  const unit1 = await prisma.unit.create({ data: { name: 'Rio de Janeiro' } });
  const unit2 = await prisma.unit.create({ data: { name: 'Recife' } });
  const unit3 = await prisma.unit.create({ data: { name: 'São Paulo' } });
  const unit4 = await prisma.unit.create({ data: { name: 'Porto Alegre' } });
  const unit5 = await prisma.unit.create({ data: { name: 'Belo Horizonte' } });
  const unit6 = await prisma.unit.create({ data: { name: 'Salvador' } });

  // Cria trilhas
  const track1 = await prisma.track.create({ data: { name: 'Trilha do Colaborador' } });
  const track2 = await prisma.track.create({ data: { name: 'Trilha de Liderança' } });
  const track3 = await prisma.track.create({ data: { name: 'Trilha Executiva' } });

  // Cria critérios
  const criteriaData = [
    { name: CriterionName.ORGANIZACAO_NO_TRABALHO, generalDescription: 'Capacidade de manter o ambiente organizado', weight: 10 },
    { name: CriterionName.ATENDER_AOS_PRAZOS, generalDescription: 'Capacidade de cumprir prazos estabelecidos', weight: 10 },
    { name: CriterionName.SENTIMENTO_DE_DONO, generalDescription: 'Responsabilidade e compromisso com resultados', weight: 10 },
    { name: CriterionName.RESILIENCIA_NAS_ADVERSIDADES, generalDescription: 'Capacidade de superar desafios', weight: 10 },
    { name: CriterionName.CAPACIDADE_DE_APRENDER, generalDescription: 'Disposição para se desenvolver continuamente', weight: 10 },
    { name: CriterionName.TEAM_PLAYER, generalDescription: 'Trabalho em equipe e colaboração', weight: 10 },
    { name: CriterionName.FAZER_MAIS_COM_MENOS, generalDescription: 'Eficiência no uso de recursos', weight: 10 },
    { name: CriterionName.ENTREGAR_COM_QUALIDADE, generalDescription: 'Qualidade nas entregas', weight: 10 },
    { name: CriterionName.PENSAR_FORA_DA_CAIXA, generalDescription: 'Criatividade e inovação', weight: 10 },
    { name: CriterionName.GENTE, generalDescription: 'Relacionamento e liderança', weight: 10 },
    { name: CriterionName.RESULTADOS, generalDescription: 'Foco em resultados e performance', weight: 10 },
    { name: CriterionName.GESTAO, generalDescription: 'Eficiência na gestão organizacional', weight: 10 },
    { name: CriterionName.EVOLUCAO_DA_ROCKET_COR, generalDescription: 'Contribuição para o crescimento da empresa', weight: 10 },
  ];

  const criteria: any[] = [];
  for (const criterionData of criteriaData) {
    const existing = await prisma.criterion.findFirst({ where: { name: criterionData.name } });
    if (!existing) {
      const criterion = await prisma.criterion.create({ data: criterionData });
      criteria.push(criterion);
    } else {
      criteria.push(existing);
    }
  }

  // Grupos para cada trilha
  const collaboratorGroup = await prisma.criterionGroup.create({
    data: { name: 'Critérios Comportamentais', trackId: track1.id, unitId: unit1.id, positionId: position1.id },
  });

  const leadershipGroup = await prisma.criterionGroup.create({
    data: { name: 'Critérios de Liderança', trackId: track2.id, unitId: unit1.id, positionId: position2.id },
  });

  const executiveGroup = await prisma.criterionGroup.create({
    data: { name: 'Critérios Estratégicos', trackId: track3.id, unitId: unit1.id, positionId: position2.id },
  });

  // Filtra critérios por ID para cada trilha
  const collaboratorCriteria = criteria.filter(c => c.id >= 1 && c.id <= 9);
  const leadershipCriteria = criteria.filter(c => c.id >= 1 && c.id <= 12);
  const executiveCriteria = criteria; // todos

  // Gera configs
  const generateConfigs = (list, groupId, trackId, positionId) => {
    return list.map(c => ({
      criterionId: c.id,
      groupId,
      trackId,
      unitId: unit1.id,
      positionId,
      mandatory: true,
      description: c.generalDescription,
      weight: c.weight,
    }));
  };

  const configs = [
    ...generateConfigs(collaboratorCriteria, collaboratorGroup.id, track1.id, position1.id),
    ...generateConfigs(leadershipCriteria, leadershipGroup.id, track2.id, position2.id),
    ...generateConfigs(executiveCriteria, executiveGroup.id, track3.id, position2.id),
  ];

  for (const config of configs) {
    await prisma.configuredCriterion.create({ data: config });
  }

  // Usuários
  const passwordHash = await bcrypt.hash('password123', 10);
  const passwordAdmin = await bcrypt.hash('adminpass', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      username: 'alice.j',
      email: 'alice@example.com',
      password: passwordHash,
      active: true,
      positionId: position1.id,
      unitId: unit1.id,
      trackId: track1.id,
      roles: { create: [{ role: 'COLLABORATOR' }] },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Manager',
      username: 'bob.m',
      email: 'bob@example.com',
      password: passwordAdmin,
      active: true,
      positionId: position2.id,
      unitId: unit1.id,
      trackId: track2.id,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'MANAGER' },
          { role: 'ADMIN' },
          { role: 'COMMITTEE' },
        ],
      },
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Lívia',
      username: 'livia.b',
      email: 'livia@example.com',
      password: passwordHash,
      active: true,
      positionId: position1.id,
      unitId: unit1.id,
      trackId: track1.id,
      roles: {
        create: [
          { role: 'COLLABORATOR' }
        ],
      },
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Marcos Gabriel',
      username: 'mgma',
      email: 'marcos@example.com',
      password: passwordHash,
      active: true,
      positionId: position2.id,
      unitId: unit1.id,
      trackId: track2.id,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'MANAGER' },
          { role: 'MENTOR' },
        ],
      },
    },
  });

  const user5 = await prisma.user.create({
    data: {
      name: 'Guilherme Santos',
      username: 'guilherme.s',
      email: 'guilherme@example.com',
      password: passwordHash,
      active: true,
      positionId: position2.id,
      unitId: unit1.id,
      trackId: track2.id,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'MENTOR' },
          { role: 'MANAGER' },
        ],
      },
    },
  });

  const user6 = await prisma.user.create({
    data: {
      name: 'Diogo Henrique',
      username: 'diogo.h',
      email: 'diogo@example.com',
      password: passwordHash,
      active: true,
      positionId: position2.id,
      unitId: unit1.id,
      trackId: track3.id,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'COMMITTEE' },
        ],
      },
    },
  });

  const user7 = await prisma.user.create({
    data: {
      name: 'Maria Luísa',
      username: 'mlmsp',
      email: 'maria@example.com',
      password: passwordHash,
      active: true,
      positionId: position1.id,
      unitId: unit1.id,
      trackId: track1.id,
      mentorId: 5,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'HR' },
        ],
      },
    },
  });

  const user8 = await prisma.user.create({
    data: {
      name: 'Rafael',
      username: 'rafael.c',
      email: 'rafael@example.com',
      password: passwordHash,
      active: true,
      positionId: position2.id,
      unitId: unit1.id,
      trackId: track1.id,
      mentorId: 4,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'HR' },
        ],
      },
    },
  }); 

  const user9 = await prisma.user.create({
    data: {
      name: 'Admin',
      username: 'admin',
      email: 'admin@example.com',
      password: passwordAdmin,
      active: true,
      positionId: position2.id,
      unitId: unit1.id,
      trackId: track3.id,
      roles: {
        create: [
          { role: 'COLLABORATOR' },
          { role: 'MANAGER' },
          { role: 'ADMIN' },
          { role: 'COMMITTEE' },
          { role: 'HR' },
          { role: 'MENTOR' }
        ],
      },
    },
  });


  //Gerentes

  await prisma.managerCollaborator.create({ data: { managerId: user2.id, collaboratorId: user1.id } });
  await prisma.managerCollaborator.create({ data: { managerId: user4.id, collaboratorId: user3.id } });
  await prisma.managerCollaborator.create({ data: { managerId: user4.id, collaboratorId: user7.id } });
  await prisma.managerCollaborator.create({ data: { managerId: user5.id, collaboratorId: user6.id } });
  await prisma.managerCollaborator.create({ data: { managerId: user5.id, collaboratorId: user8.id } });



  // Projetos
  const projects = [
    { name: 'Project RocketCorp Backend', description: 'Backend do sistema' },
    { name: 'Project RocketCorp Frontend', description: 'Frontend do sistema' },
  ];

  for (const proj of projects) {
    await prisma.project.create({ data: proj });
  }

  console.log('✅ Seed finalizado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
