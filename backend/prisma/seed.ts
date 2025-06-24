import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Apaga avaliações relacionadas antes de apagar usuários
  await prisma.reference.deleteMany();
  await prisma.peerEvaluation.deleteMany();
  await prisma.mentorEvaluation.deleteMany();
  await prisma.$executeRawUnsafe(`DELETE FROM FinalEvaluation`);
  await prisma.userRole.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password1',
        roles: {
          create: [{ role: Role.COLLABORATOR }],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: 'Bob',
        email: 'bob@example.com',
        password: 'password2',
        roles: {
          create: [{ role: Role.COLLABORATOR }],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carol',
        email: 'carol@example.com',
        password: 'password3',
        roles: {
          create: [{ role: Role.MANAGER }],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dave',
        email: 'dave@example.com',
        password: 'password4',
        roles: {
          create: [{ role: Role.COLLABORATOR }],
        },
      },
    }),
    prisma.user.create({
      data: {
        name: 'Eve',
        email: 'eve@example.com',
        password: 'password5',
        roles: {
          create: [{ role: Role.COMMITTEE }],
        },
      },
    }),
  ]);

  // Criar avaliações
  for (const evaluated of users) {
    const evaluator = users.find(u => u.id !== evaluated.id) || users[0];

    // Peer Evaluation
    await prisma.peerEvaluation.create({
      data: {
        evaluatorId: evaluator.id,
        evaluateeId: evaluated.id,
        score: 4,
        strengths: 'Colabora bem com a equipe.',
        improvements: 'Precisa melhorar prazos.',
      },
    });

    // Mentor Evaluation
    await prisma.mentorEvaluation.create({
      data: {
        evaluatorId: evaluator.id,
        evaluateeId: evaluated.id,
        score: 5,
        justification: 'Ótimo desempenho e liderança.',
      },
    });

    // Reference
    await prisma.reference.create({
      data: {
        providerId: evaluator.id,
        receiverId: evaluated.id,
        justification: 'Trabalhamos juntos no último projeto.',
      },
    });
  }

  // Final Evaluation SOMENTE para 2 usuários (Alice e Bob)
  await prisma.$executeRawUnsafe(`
    INSERT INTO FinalEvaluation (evaluatorId, evaluateeId, createdAt, editedAt, score, justification)
    VALUES
      (${users[2].id}, ${users[0].id}, datetime('now'), datetime('now'), 4.5, 'Muito boa entrega final.'),
      (${users[2].id}, ${users[1].id}, datetime('now'), datetime('now'), 3.8, 'Bom, mas pode melhorar.');
  `);

  console.log('Seed criado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
