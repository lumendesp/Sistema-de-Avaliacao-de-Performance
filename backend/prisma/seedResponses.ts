import { PrismaClient, ClimateLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function seedClimateSurvey() {
  const activeUser = await prisma.user.findFirst({
    where: { active: true },
  });

  if (!activeUser) {
    console.log('Nenhum usuário ativo encontrado para createdById');
    return;
  }

  const survey = await prisma.climateSurvey.create({
    data: {
      title: `Pesquisa de Clima ${new Date().getFullYear()}`,
      description: 'Pesquisa de clima para testes com IA',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdById: activeUser.id,
    },
  });

  console.log(`Pesquisa criada: ${survey.title}`);

  await prisma.climateSurveyQuestion.createMany({
    data: [
      {
        surveyId: survey.id,
        text: 'Você se sente reconhecido pela liderança?',
      },
      {
        surveyId: survey.id,
        text: 'Você se considera motivado no trabalho?',
      },
      {
        surveyId: survey.id,
        text: 'O ambiente de trabalho é saudável?',
      },
      {
        surveyId: survey.id,
        text: 'Você sente que tem oportunidades de crescimento?',
      },
    ],
  });

  console.log('Perguntas criadas');

  const allQuestions = await prisma.climateSurveyQuestion.findMany({
    where: { surveyId: survey.id },
  });

  const users = await prisma.user.findMany({
    where: { active: true },
    take: 5,
  });

  const levels = [
    ClimateLevel.CONCORDO_TOTALMENTE,
    ClimateLevel.CONCORDO_PARCIALMENTE,
    ClimateLevel.NEUTRO,
    ClimateLevel.DISCORDO_PARCIALMENTE,
    ClimateLevel.DISCORDO_TOTALMENTE,
  ];

  for (const user of users) {
    const response = await prisma.climateSurveyResponse.create({
      data: {
        surveyId: survey.id,
        hashId: `resp-${user.id}-${Date.now()}`,
        isSubmit: true,
        submittedAt: new Date(),
        userId: user.id, // ✅ Adicionado
      },
    });

    for (const question of allQuestions) {
      const level = levels[Math.floor(Math.random() * levels.length)];

      const justificationSamples = [
        'A liderança sempre reconhece meus esforços.',
        'Sinto que meu trabalho não é valorizado.',
        'O ambiente é muito colaborativo.',
        'Sinto que as oportunidades de crescimento são limitadas.',
        'Tenho autonomia nas minhas atividades diárias.',
        'Gostaria de receber mais feedback da liderança.',
        'A comunicação na equipe é boa.',
        'Há uma falta de transparência em algumas decisões.',
      ];

      const justification =
        justificationSamples[
          Math.floor(Math.random() * justificationSamples.length)
        ];

      await prisma.climateSurveyAnswer.create({
        data: {
          questionId: question.id,
          responseId: response.id,
          level,
          justification,
        },
      });
    }
  }

  console.log('Respostas geradas com justificativas realistas!');
}

async function main() {
  await seedClimateSurvey();
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());
