import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearData() {
  // apaga as tabelas que possuem dependências primeiro
  await prisma.peerEvaluationProject.deleteMany();
  await prisma.peerEvaluation.deleteMany();
  await prisma.mentorEvaluationItem.deleteMany();
  await prisma.mentorEvaluation.deleteMany();
  await prisma.managerEvaluationItem.deleteMany();
  await prisma.managerEvaluation.deleteMany();
  await prisma.selfEvaluationItem.deleteMany();
  await prisma.selfEvaluation.deleteMany();
  await prisma.reference.deleteMany();
  await prisma.finalScore.deleteMany();
  await prisma.discrepancy.deleteMany();
  await prisma.aISummary.deleteMany();
  await prisma.committeeNote.deleteMany();

  // apaga relacionamentos de roles antes de apagar usuários
  await prisma.userRole.deleteMany();

  // apaga os usuários
  await prisma.user.deleteMany();

  // apaga os critérios configurados e critérios
  await prisma.configuredCriterion.deleteMany();
  await prisma.criterion.deleteMany();

  // apaga os projetos
  await prisma.project.deleteMany();

  // apaga os ciclos de avaliação
  await prisma.evaluationCycle.deleteMany();

  // apaga posições, unidades, trilhas
  await prisma.position.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.track.deleteMany();

  // aqui é para zerar os ids que são incrementados automaticamente
  const tablesToReset = [
    'PeerEvaluationProject',
    'PeerEvaluation',
    'MentorEvaluationItem',
    'MentorEvaluation',
    'ManagerEvaluationItem',
    'ManagerEvaluation',
    'SelfEvaluationItem',
    'SelfEvaluation',
    'Reference',
    'FinalScore',
    'Discrepancy',
    'AISummary',
    'CommitteeNote',
    'UserRole',
    'User',
    'ConfiguredCriterion',
    'Criterion',
    'Project',
    'EvaluationCycle',
    'Position',
    'Unit',
    'Track',
  ];

  for (const tableName of tablesToReset) {
    await prisma.$executeRawUnsafe(
      `DELETE FROM sqlite_sequence WHERE name = '${tableName}';`,
    );
  }

  console.log('✅ Todos os dados apagados com sucesso!');
}

clearData()
  .catch((e) => {
    console.error('Erro ao apagar dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
