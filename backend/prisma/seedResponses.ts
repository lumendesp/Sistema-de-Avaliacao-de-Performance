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

  // Perguntas realistas de clima organizacional
  const questionData = [
    {
      text: 'Sinto que meu trabalho é reconhecido pela liderança.',
      justifications: {
        positive: [
          'Minha liderança sempre elogia minhas entregas.',
          'Recebo feedbacks positivos frequentemente.',
          'Me sinto valorizado pelo meu gestor.',
        ],
        negative: [
          'Raramente recebo reconhecimento pelo que faço.',
          'Sinto que meu esforço passa despercebido.',
          'Falta valorização por parte da liderança.',
        ],
      },
    },
    {
      text: 'Tenho oportunidades claras de crescimento na empresa.',
      justifications: {
        positive: [
          'Vejo um plano de carreira bem definido.',
          'Já fui promovido e vejo chances de crescer.',
          'A empresa incentiva o desenvolvimento profissional.',
        ],
        negative: [
          'Não vejo oportunidades de promoção.',
          'O crescimento parece limitado para minha área.',
          'Falta clareza sobre como evoluir na empresa.',
        ],
      },
    },
    {
      text: 'O ambiente de trabalho é saudável e colaborativo.',
      justifications: {
        positive: [
          'Me dou bem com meus colegas e há respeito mútuo.',
          'O clima é leve e todos se ajudam.',
          'A equipe é unida e colaborativa.',
        ],
        negative: [
          'Há muitos conflitos e pouca colaboração.',
          'O ambiente é tenso e competitivo.',
          'Sinto falta de espírito de equipe.',
        ],
      },
    },
    {
      text: 'Recebo feedbacks construtivos sobre meu desempenho.',
      justifications: {
        positive: [
          'Meu gestor sempre me orienta para melhorar.',
          'Recebo feedbacks claros e construtivos.',
          'As avaliações são frequentes e ajudam no meu desenvolvimento.',
        ],
        negative: [
          'Raramente recebo feedbacks.',
          'Não sei se estou indo bem ou mal.',
          'Falta retorno sobre meu desempenho.',
        ],
      },
    },
    {
      text: 'Sinto que minha carga de trabalho é adequada.',
      justifications: {
        positive: [
          'Consigo equilibrar bem as demandas.',
          'Minha carga de trabalho é justa.',
          'Tenho tempo para realizar minhas tarefas com qualidade.',
        ],
        negative: [
          'Estou sempre sobrecarregado.',
          'As demandas são excessivas e difíceis de cumprir.',
          'Falta equilíbrio na distribuição das tarefas.',
        ],
      },
    },
  ];

  const survey = await prisma.climateSurvey.create({
    data: {
      title: `Pesquisa de Clima ${new Date().getFullYear()}`,
      description: 'Pesquisa de clima para testes com IA',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdById: activeUser.id,
    },
  });

  console.log(`Pesquisa criada: ${survey.title}`);

  // Cria as perguntas
  for (const q of questionData) {
    await prisma.climateSurveyQuestion.create({
      data: {
        surveyId: survey.id,
        text: q.text,
      },
    });
  }

  console.log('Perguntas criadas');

  const allQuestions = await prisma.climateSurveyQuestion.findMany({
    where: { surveyId: survey.id },
    orderBy: { id: 'asc' },
  });

  const users = await prisma.user.findMany({
    where: { active: true },
    take: 5,
  });

  // Níveis de concordância e relação com justificativas
  const levelMap = [
    { level: ClimateLevel.CONCORDO_TOTALMENTE, type: 'positive' },
    { level: ClimateLevel.CONCORDO_PARCIALMENTE, type: 'positive' },
    { level: ClimateLevel.NEUTRO, type: 'positive' }, // pode ser neutro, mas para simplificar
    { level: ClimateLevel.DISCORDO_PARCIALMENTE, type: 'negative' },
    { level: ClimateLevel.DISCORDO_TOTALMENTE, type: 'negative' },
  ];

  for (const [userIdx, user] of users.entries()) {
    const response = await prisma.climateSurveyResponse.create({
      data: {
        surveyId: survey.id,
        hashId: `resp-${user.id}-${Date.now()}`,
        isSubmit: true,
        submittedAt: new Date(),
      },
    });

    for (const [qIdx, question] of allQuestions.entries()) {
      // Para cada usuário, alterna o nível de concordância para simular diversidade
      const levelInfo = levelMap[(userIdx + qIdx) % levelMap.length];
      const justType = levelInfo.type;
      // Busca justificativas realistas para a pergunta
      const justList = questionData[qIdx].justifications[justType];
      const justification =
        justList[Math.floor(Math.random() * justList.length)];

      await prisma.climateSurveyAnswer.create({
        data: {
          questionId: question.id,
          responseId: response.id,
          level: levelInfo.level,
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
