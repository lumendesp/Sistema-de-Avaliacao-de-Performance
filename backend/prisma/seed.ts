import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.selfEvaluationItem.deleteMany();
  await prisma.selfEvaluation.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();
  await prisma.configuredCriterion.deleteMany();
  await prisma.criterion.deleteMany();
  await prisma.evaluationCycle.deleteMany();
  await prisma.track.deleteMany();

  await prisma.unit.deleteMany();
  await prisma.position.deleteMany();
  // Criar posições
  const [position1, position2] = await Promise.all([
    prisma.position.create({ data: { name: 'Developer' } }),
    prisma.position.create({ data: { name: 'Manager' } }),
  ]);

  // Criar unidades
  const [unit1, unit2] = await Promise.all([
    prisma.unit.create({ data: { name: 'Engineering' } }),
    prisma.unit.create({ data: { name: 'HR' } }),
  ]);

  // Criar trilhas
  const [track1, track2] = await Promise.all([
    prisma.track.create({ data: { name: 'Backend' } }),
    prisma.track.create({ data: { name: 'Frontend' } }),
  ]);

  // Criar usuários
  const [passwordHash1, passwordHash2] = await Promise.all([
    bcrypt.hash('password123', 10),
    bcrypt.hash('adminpass', 10),
  ]);

  const [user1, user2] = await Promise.all([
    prisma.user.create({
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
    }),
    prisma.user.create({
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
          create: [{ role: 'MANAGER' }, { role: 'ADMIN' }],
        },
      },
    }),
  ]);

  // Relacionar Alice como colaboradora gerenciada por Bob
  await prisma.managerCollaborator.create({
    data: {
      managerId: user2.id, // Bob
      collaboratorId: user1.id, // Alice
    },
  });

  // Criar critérios
  const [criterion1, criterion2] = await Promise.all([
    prisma.criterion.create({
      data: {
        name: 'Resiliência nas adversidades',
        generalDescription:
          'Capacidade de manter desempenho diante de desafios',
        active: true,
      },
    }),
    prisma.criterion.create({
      data: {
        name: 'Sentimento de dono',
        generalDescription: 'Proatividade e responsabilidade sobre entregas',
        active: true,
      },
    }),
  ]);

  // Relacionar critérios à configuração da posição + trilha + unidade
  await Promise.all([
    prisma.configuredCriterion.create({
      data: {
        criterionId: criterion1.id,
        trackId: track1.id,
        unitId: unit1.id,
        positionId: position1.id,
        mandatory: true,
      },
    }),
    prisma.configuredCriterion.create({
      data: {
        criterionId: criterion2.id,
        trackId: track1.id,
        unitId: unit1.id,
        positionId: position1.id,
        mandatory: true,
      },
    }),
  ]);

  // Criar ciclo de avaliação
  const cycle = await prisma.evaluationCycle.create({
    data: {
      name: 'Ciclo Teste',
      startDate: new Date('2025-07-01'),
      endDate: new Date('2025-12-31'),
      status: 'IN_PROGRESS',
    },
  });

  console.log('✅ Seed executada com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
