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

  // Hash simples
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
        create: [{ role: 'MANAGER' }, { role: 'ADMIN' }],
      },
    },
  });

  // Cria critérios + relacionamento com Backend/Developer/Engineering
  const criterios = [
    'Organização no Trabalho',
    'Atender aos prazos',
    'Sentimento de Dono',
    'Resiliência nas adversidades',
    'Capacidade de aprender',
    'Ser "team player"',
    'Fazer mais com menos',
    'Entregar com qualidade',
    'Pensar fora da caixa',
    'Gente',
    'Resultados',
    'Evolução da Rocket Cor',
  ];

  for (const nome of criterios) {
    const criterio = await prisma.criterion.create({
      data: {
        name: nome,
        generalDescription: `Descrição do critério: ${nome}`,
      },
    });

    await prisma.configuredCriterion.create({
      data: {
        criterionId: criterio.id,
        trackId: track1.id,
        positionId: position1.id,
        unitId: unit1.id,
        mandatory: true,
      },
    });
  }

  // Cria ciclo
  await prisma.evaluationCycle.create({
    data: {
      name: '2025 Mid-Year Cycle',
      startDate: new Date('2025-06-01T00:00:00Z'),
      endDate: new Date('2025-07-31T23:59:59Z'),
      status: 'IN_PROGRESS',
    },
  });

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
