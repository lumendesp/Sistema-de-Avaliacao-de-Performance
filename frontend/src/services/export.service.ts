import * as XLSX from 'xlsx';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  unit: string;
  position: string;
  track: string;
}

interface SelfEvaluationItem {
  criterion: string;
  generalDescription: string;
  selfEvaluation: number;
  scoreDescription: string;
  justification: string;
}

interface PeerEvaluation {
  evaluatorEmail: string;
  evaluatorName: string;
  projects: string;
  period: string;
  motivatedToWorkAgain: string;
  overallGrade: number;
  improvementPoints: string;
  strengths: string;
}

interface MentorEvaluation {
  evaluatorEmail: string;
  evaluatorName: string;
  score: number;
  scoreDescription: string;
  justification: string;
}

interface ManagerEvaluationItem {
  criterion: string;
  generalDescription: string;
  score: number;
  scoreDescription: string;
  justification: string;
}

interface ManagerEvaluation {
  evaluatorEmail: string;
  evaluatorName: string;
  items: ManagerEvaluationItem[];
  overallScore?: number;
}

interface Reference {
  referenceEmail: string;
  referenceName: string;
  justification: string;
}

interface EvaluationData {
  userProfile: UserProfile;
  selfEvaluation: SelfEvaluationItem[];
  peerEvaluations: PeerEvaluation[];
  mentorEvaluations: MentorEvaluation[];
  managerEvaluations: ManagerEvaluation[];
  references: Reference[];
  cycle: string;
}

export const exportEvaluationToExcel = (data: EvaluationData, fileName?: string) => {
  const wb = XLSX.utils.book_new();
  
  // Sheet 1: User Profile (Perfil do Usuário)
  const profileData = [
    {
      'Nome': data.userProfile.name,
      'Email': data.userProfile.email,
      'Ciclo em que a avaliação foi realizada (ano.semestre)': data.cycle,
      'Unidade': data.userProfile.unit,
      'Cargo': data.userProfile.position,
      'Trilha': data.userProfile.track
    }
  ];
  
  console.log("TESTE DO EXPORT", data);

  const profileSheet = XLSX.utils.json_to_sheet(profileData);
  XLSX.utils.book_append_sheet(wb, profileSheet, 'Perfil do Usuário');
  
  // Sheet 2: Self Evaluation (Autoavaliação)
  const selfEvaluationData = data.selfEvaluation.map(item => ({
    'Critério': item.criterion,
    'Descrição Geral': item.generalDescription,
    'Autoavaliação (nota)': item.selfEvaluation,
    'Descrição da Nota': item.scoreDescription,
    'Dados e Fatos que Justificam': item.justification
  }));
  
  const selfEvaluationSheet = XLSX.utils.json_to_sheet(selfEvaluationData);
  XLSX.utils.book_append_sheet(wb, selfEvaluationSheet, 'Autoavaliação');
  
  // Sheet 3: 360 Evaluation (Avaliação 360)
  const peerEvaluationData = data.peerEvaluations.map(item => ({
    'Email do avaliador (primeiro.último)': item.evaluatorEmail,
    'Nome do Avaliador': item.evaluatorName,
    'Projetos que trabalharam juntos': item.projects,
    'Período': item.period,
    'Motivado a trabalhar novamente': item.motivatedToWorkAgain,
    'Nota geral para o funcionário': item.overallGrade,
    'Pontos para melhoria': item.improvementPoints,
    'Pontos fortes e que podem ser explorados': item.strengths
  }));
  
  const peerEvaluationSheet = XLSX.utils.json_to_sheet(peerEvaluationData);
  XLSX.utils.book_append_sheet(wb, peerEvaluationSheet, 'Avaliação 360');
  
  // Sheet 4: Mentor Evaluation (Avaliação do Mentor)
  const mentorEvaluationData = data.mentorEvaluations.map(item => ({
    'Email do Mentor': item.evaluatorEmail,
    'Nome do Mentor': item.evaluatorName,
    'Nota': item.score,
    'Descrição da Nota': item.scoreDescription,
    'Justificativa': item.justification
  }));
  
  const mentorEvaluationSheet = XLSX.utils.json_to_sheet(mentorEvaluationData);
  XLSX.utils.book_append_sheet(wb, mentorEvaluationSheet, 'Avaliação do Mentor');
  
  // Sheet 5: Manager Evaluation (Avaliação do Gestor)
  const managerEvaluationData: any[] = [];
  data.managerEvaluations.forEach(managerEval => {
    if (managerEval.items && managerEval.items.length > 0) {
      managerEval.items.forEach(item => {
        managerEvaluationData.push({
          'Email do Gestor': managerEval.evaluatorEmail,
          'Nome do Gestor': managerEval.evaluatorName,
          'Critério': item.criterion,
          'Descrição Geral': item.generalDescription,
          'Nota': item.score,
          'Descrição da Nota': item.scoreDescription,
          'Justificativa': item.justification
        });
      });
    } else {
      // If no items, add a row with overall score
      managerEvaluationData.push({
        'Email do Gestor': managerEval.evaluatorEmail,
        'Nome do Gestor': managerEval.evaluatorName,
        'Critério': 'Avaliação Geral',
        'Descrição Geral': 'Avaliação geral do gestor',
        'Nota': managerEval.overallScore || 0,
        'Descrição da Nota': getScoreDescription(managerEval.overallScore || 0),
        'Justificativa': 'Avaliação geral do gestor'
      });
    }
  });
  
  const managerEvaluationSheet = XLSX.utils.json_to_sheet(managerEvaluationData);
  XLSX.utils.book_append_sheet(wb, managerEvaluationSheet, 'Avaliação do Gestor');
  
  // Sheet 6: Reference Search (Pesquisa de Referência)
  const referenceData = data.references.map(item => ({
    'Email da referência (primeiro.último)': item.referenceEmail,
    'Nome da Referência': item.referenceName,
    'Justificativa': item.justification
  }));
  
  const referenceSheet = XLSX.utils.json_to_sheet(referenceData);
  XLSX.utils.book_append_sheet(wb, referenceSheet, 'Pesquisa de Referência');
  
  // Generate filename
  const nameParts = data.userProfile.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const semester = month <= 6 ? 1 : 2;
  
  const finalFileName = fileName || `${firstName}_${lastName}_${year}_${semester}.xlsx`;
  
  // Save the file
  XLSX.writeFile(wb, finalFileName);
};

export const exportEvaluationToCSV = (data: EvaluationData, fileName?: string) => {
  // Generate filename
  const nameParts = data.userProfile.name.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const semester = month <= 6 ? 1 : 2;
  
  const finalFileName = fileName || `${firstName}_${lastName}_${year}_${semester}.csv`;
  
  // Create CSV content for all sheets
  let csvContent = '';
  
  // Sheet 1: User Profile
  csvContent += '=== PERFIL DO USUÁRIO ===\n';
  csvContent += 'Nome,Email,Ciclo em que a avaliação foi realizada (ano.semestre),Unidade,Cargo,Trilha\n';
  csvContent += `${data.userProfile.name},${data.userProfile.email},${data.cycle},${data.userProfile.unit},${data.userProfile.position},${data.userProfile.track}\n\n`;
  
  // Sheet 2: Self Evaluation
  csvContent += '=== AUTOAVALIAÇÃO ===\n';
  csvContent += 'Critério,Descrição Geral,Autoavaliação (nota),Descrição da Nota,Dados e Fatos que Justificam\n';
  data.selfEvaluation.forEach(item => {
    csvContent += `"${item.criterion}","${item.generalDescription}",${item.selfEvaluation},"${item.scoreDescription}","${item.justification}"\n`;
  });
  csvContent += '\n';
  
  // Sheet 3: 360 Evaluation
  csvContent += '=== AVALIAÇÃO 360 ===\n';
  csvContent += 'Email do avaliador (primeiro.último),Nome do Avaliador,Projetos que trabalharam juntos,Período,Motivado a trabalhar novamente,Nota geral para o funcionário,Pontos para melhoria,Pontos fortes e que podem ser explorados\n';
  data.peerEvaluations.forEach(item => {
    csvContent += `"${item.evaluatorEmail}","${item.evaluatorName}","${item.projects}","${item.period}","${item.motivatedToWorkAgain}",${item.overallGrade},"${item.improvementPoints}","${item.strengths}"\n`;
  });
  csvContent += '\n';
  
  // Sheet 4: Mentor Evaluation
  csvContent += '=== AVALIAÇÃO DO MENTOR ===\n';
  csvContent += 'Email do Mentor,Nome do Mentor,Nota,Descrição da Nota,Justificativa\n';
  data.mentorEvaluations.forEach(item => {
    csvContent += `"${item.evaluatorEmail}","${item.evaluatorName}",${item.score},"${item.scoreDescription}","${item.justification}"\n`;
  });
  csvContent += '\n';
  
  // Sheet 5: Manager Evaluation
  csvContent += '=== AVALIAÇÃO DO GESTOR ===\n';
  csvContent += 'Email do Gestor,Nome do Gestor,Critério,Descrição Geral,Nota,Descrição da Nota,Justificativa\n';
  data.managerEvaluations.forEach(managerEval => {
    if (managerEval.items && managerEval.items.length > 0) {
      managerEval.items.forEach(item => {
        csvContent += `"${managerEval.evaluatorEmail}","${managerEval.evaluatorName}","${item.criterion}","${item.generalDescription}",${item.score},"${item.scoreDescription}","${item.justification}"\n`;
      });
    } else {
      csvContent += `"${managerEval.evaluatorEmail}","${managerEval.evaluatorName}","Avaliação Geral","Avaliação geral do gestor",${managerEval.overallScore || 0},"${getScoreDescription(managerEval.overallScore || 0)}","Avaliação geral do gestor"\n`;
    }
  });
  csvContent += '\n';
  
  // Sheet 6: Reference Search
  csvContent += '=== PESQUISA DE REFERÊNCIA ===\n';
  csvContent += 'Email da referência (primeiro.último),Nome da Referência,Justificativa\n';
  data.references.forEach(item => {
    csvContent += `"${item.referenceEmail}","${item.referenceName}","${item.justification}"\n`;
  });
  
  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalFileName;
  a.click();
  URL.revokeObjectURL(url);
};

// Helper function to create sample data for testing
export const createSampleEvaluationData = (userName: string, userEmail: string): EvaluationData => {
  return {
    userProfile: {
      id: 1,
      name: userName,
      email: userEmail,
      unit: 'Engenharia',
      position: 'Desenvolvedor',
      track: 'Backend'
    },
    cycle: '2024.2',
    selfEvaluation: [
      {
        criterion: 'Organização no Trabalho',
        generalDescription: 'Capacidade de manter o ambiente organizado e cumprir prazos estabelecidos',
        selfEvaluation: 4.0,
        scoreDescription: 'Excelente',
        justification: 'Mantive todos os projetos organizados e documentados durante o ciclo. Sempre entreguei dentro dos prazos estabelecidos e mantive comunicação clara com a equipe sobre o progresso.'
      },
      {
        criterion: 'Team Player',
        generalDescription: 'Capacidade de trabalhar em equipe e colaborar efetivamente',
        selfEvaluation: 4.5,
        scoreDescription: 'Excelente',
        justification: 'Colaborei ativamente com a equipe em todos os projetos, sempre disponível para ajudar colegas e compartilhar conhecimento. Participei de code reviews e mentoria de novos desenvolvedores.'
      },
      {
        criterion: 'Entregar com Qualidade',
        generalDescription: 'Compromisso com a qualidade das entregas e boas práticas',
        selfEvaluation: 4.2,
        scoreDescription: 'Muito Bom',
        justification: 'Todas as entregas foram feitas com alta qualidade, seguindo padrões de código e incluindo testes adequados. Sempre busquei feedback e implementei melhorias baseadas nas sugestões.'
      },
      {
        criterion: 'Sentimento de Dono',
        generalDescription: 'Demonstra responsabilidade e compromisso com os resultados',
        selfEvaluation: 4.3,
        scoreDescription: 'Muito Bom',
        justification: 'Tomei iniciativa em identificar e resolver problemas proativamente. Sempre me preocupei com o impacto das minhas entregas no produto final e na experiência do usuário.'
      },
      {
        criterion: 'Capacidade de Aprender',
        generalDescription: 'Disposição para aprender e se desenvolver continuamente',
        selfEvaluation: 4.1,
        scoreDescription: 'Muito Bom',
        justification: 'Dediquei tempo para estudar novas tecnologias e metodologias. Participei de treinamentos e workshops, e apliquei os conhecimentos adquiridos nos projetos.'
      }
    ],
    peerEvaluations: [
      {
        evaluatorEmail: 'joao.silva@empresa.com',
        evaluatorName: 'João Silva',
        projects: 'Sistema de Pagamentos, API Gateway, Microserviços de Autenticação',
        period: '8 meses',
        motivatedToWorkAgain: 'Sim',
        overallGrade: 4.3,
        improvementPoints: 'Poderia melhorar a documentação técnica e ser mais proativo em sugerir melhorias de arquitetura',
        strengths: 'Excelente comunicação, muito proativo, sempre disponível para ajudar, resolve problemas complexos rapidamente, tem boa visão técnica'
      },
      {
        evaluatorEmail: 'maria.santos@empresa.com',
        evaluatorName: 'Maria Santos',
        projects: 'Dashboard Analytics, Sistema de Relatórios, Integração com APIs Externas',
        period: '6 meses',
        motivatedToWorkAgain: 'Sim',
        overallGrade: 4.0,
        improvementPoints: 'Às vezes demora para responder mensagens e poderia ser mais assertivo em reuniões',
        strengths: 'Muito técnico, resolve problemas complexos rapidamente, tem conhecimento profundo das tecnologias, é confiável'
      }
    ],
    mentorEvaluations: [
      {
        evaluatorEmail: 'carlos.mentor@empresa.com',
        evaluatorName: 'Carlos Mentor',
        score: 4.5,
        scoreDescription: 'Excelente',
        justification: 'Excelente mentorado, sempre demonstrou interesse em aprender e crescer. Muito proativo e dedicado ao desenvolvimento pessoal e profissional.'
      }
    ],
    managerEvaluations: [
      {
        evaluatorEmail: 'ana.gestora@empresa.com',
        evaluatorName: 'Ana Gestora',
        items: [
          {
            criterion: 'Organização no Trabalho',
            generalDescription: 'Capacidade de manter o ambiente organizado e cumprir prazos estabelecidos',
            score: 4.2,
            scoreDescription: 'Muito Bom',
            justification: 'Mantém excelente organização e sempre cumpre os prazos estabelecidos. Comunica claramente o progresso dos projetos.'
          },
          {
            criterion: 'Team Player',
            generalDescription: 'Capacidade de trabalhar em equipe e colaborar efetivamente',
            score: 4.4,
            scoreDescription: 'Muito Bom',
            justification: 'Excelente colaborador, sempre disponível para ajudar a equipe e compartilhar conhecimento.'
          }
        ],
        overallScore: 4.3
      }
    ],
    references: [
      {
        referenceEmail: 'carlos.rodrigues@empresa.com',
        referenceName: 'Carlos Rodrigues',
        justification: 'Excelente profissional, sempre entrega com qualidade e dentro do prazo. Muito colaborativo e sempre disposto a ajudar a equipe. Tem boa visão técnica e é confiável.'
      },
      {
        referenceEmail: 'julia.ferreira@empresa.com',
        referenceName: 'Júlia Ferreira',
        justification: 'Muito competente tecnicamente e sempre busca aprender novas tecnologias. É um ótimo colega de trabalho, sempre disponível para ajudar e compartilhar conhecimento.'
      }
    ]
  };
};

// Function to transform backend data to export format
export const transformBackendDataToExport = (backendData: any): EvaluationData => {
  console.log('Backend data for export:', backendData);

  const userProfile: UserProfile = {
    id: backendData.id,
    name: backendData.name,
    email: backendData.email || `${backendData.name.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
    unit: backendData.unit || 'Não informado',
    position: backendData.position || 'Não informado',
    track: backendData.track || 'Não informado',
  };

  const selfEvaluation: SelfEvaluationItem[] = backendData.autoAvaliacao
    ? [
        {
          criterion: 'Nota da Autoavaliação',
          generalDescription: 'Autoavaliação geral do colaborador',
          selfEvaluation: backendData.autoAvaliacao,
          scoreDescription: getScoreDescription(backendData.autoAvaliacao),
          justification: backendData.justificativaAutoAvaliacao || 'Sem justificativa',
        },
      ]
    : [];

  const peerEvaluations: PeerEvaluation[] = backendData.avaliacao360
    ? [
        {
          evaluatorEmail: 'avaliador360@empresa.com',
          evaluatorName: 'Avaliador 360',
          projects: 'Não informado',
          period: 'Não informado',
          motivatedToWorkAgain: 'Não informado',
          overallGrade: backendData.avaliacao360,
          improvementPoints: 'Não informado',
          strengths: backendData.justificativa360 || 'Sem justificativa',
        },
      ]
    : [];

  const mentorEvaluations: MentorEvaluation[] = backendData.notaMentor
    ? [
        {
          evaluatorEmail: 'mentor@empresa.com',
          evaluatorName: 'Mentor Padrão',
          score: backendData.notaMentor,
          scoreDescription: getScoreDescription(backendData.notaMentor),
          justification: backendData.justificativaMentor || 'Sem justificativa',
        },
      ]
    : [];

  const managerEvaluations: ManagerEvaluation[] = backendData.notaGestor
    ? [
        {
          evaluatorEmail: 'gestor@empresa.com',
          evaluatorName: 'Gestor Padrão',
          items: [
            {
              criterion: 'Nota da Avaliação do Gestor',
              generalDescription: 'Avaliação geral do gestor',
              score: backendData.notaGestor,
              scoreDescription: getScoreDescription(backendData.notaGestor),
              justification: backendData.justificativaGestor || 'Sem justificativa',
            },
          ],
          overallScore: backendData.notaGestor,
        },
      ]
    : [];

  const references: Reference[] = []; // Pode ser adicionado posteriormente se necessário.

  const cycle = backendData.cycle || '2024.2';

  const result: EvaluationData = {
    userProfile,
    selfEvaluation,
    peerEvaluations,
    mentorEvaluations,
    managerEvaluations,
    references,
    cycle,
  };

  console.log('Transformed data for export:', result);
  return result;
};


// Helper function to get score description
function getScoreDescription(score: number): string {
  switch (score) {
    case 1:
      return 'Fica muito abaixo das expectativas';
    case 2:
      return 'Fica abaixo das expectativas';
    case 3:
      return 'Atinge as expectativas';
    case 4:
      return 'Fica acima das expectativas';
    case 5:
      return 'Supera as expectativas';
    default:
      return 'Nota inválida';
  }
}

// Helper function to map motivation level
function mapMotivationLevel(motivation: string): string {
  switch (motivation) {
    case 'CONCORDO_TOTALMENTE':
      return 'Sim';
    case 'CONCORDO_PARCIALMENTE':
      return 'Sim, com ressalvas';
    case 'DISCORDO_PARCIALMENTE':
      return 'Não, com ressalvas';
    case 'DISCORDO_TOTALMENTE':
      return 'Não';
    default:
      return 'Não informado';
  }
} 