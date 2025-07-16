import { PrismaClient, MotivationLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function createClimateSurveyResponses() {
  const survey = await prisma.climateSurvey.findFirst({
    include: { questions: true },
  });

  if (!survey) {
    console.log('Nenhuma pesquisa de clima encontrada para popular respostas');
    return;
  }

  const users = await prisma.user.findMany({
    where: { active: true },
    take: 3,
  });

  for (const user of users) {
    const response = await prisma.climateSurveyResponse.create({
      data: {
        surveyId: survey.id,
        hashId: `resp-${user.id}-${Date.now()}`,
        isSubmit: true,
        submittedAt: new Date(),
      },
    });

    const levels = [
      MotivationLevel.CONCORDO_TOTALMENTE,
      MotivationLevel.CONCORDO_PARCIALMENTE,
      MotivationLevel.DISCORDO_PARCIALMENTE,
      MotivationLevel.DISCORDO_TOTALMENTE,
    ];

    for (const question of survey.questions) {
      const level = levels[(user.id + question.id) % levels.length];

      await prisma.climateSurveyAnswer.create({
        data: {
          questionId: question.id,
          responseId: response.id,
          level,
          justification: `Justificativa do usuário ${user.name} para a pergunta "${question.text}"`,
        },
      });
    }
  }

  console.log('Respostas de pesquisa de clima criadas com sucesso!');
}

async function main() {
  await createClimateSurveyResponses();
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
