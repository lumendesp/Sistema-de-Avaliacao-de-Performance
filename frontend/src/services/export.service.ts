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

interface Reference {
  referenceEmail: string;
  referenceName: string;
  justification: string;
}

interface EvaluationData {
  userProfile: UserProfile;
  selfEvaluation: SelfEvaluationItem[];
  peerEvaluations: PeerEvaluation[];
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
      'Unidade': data.userProfile.unit
    }
  ];
  
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
    'Email do avaliado (primeiro.último)': item.evaluatorEmail,
    'Projetos que trabalharam juntos': item.projects,
    'Período': item.period,
    'Motivado a trabalhar novamente': item.motivatedToWorkAgain,
    'Nota geral para o funcionário': item.overallGrade,
    'Pontos para melhoria': item.improvementPoints,
    'Pontos fortes e que podem ser explorados': item.strengths
  }));
  
  const peerEvaluationSheet = XLSX.utils.json_to_sheet(peerEvaluationData);
  XLSX.utils.book_append_sheet(wb, peerEvaluationSheet, 'Avaliação 360');
  
  // Sheet 4: Reference Search (Pesquisa de Referência)
  const referenceData = data.references.map(item => ({
    'Email da referência (primeiro.último)': item.referenceEmail,
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
  csvContent += 'Nome,Email,Ciclo em que a avaliação foi realizada (ano.semestre),Unidade\n';
  csvContent += `${data.userProfile.name},${data.userProfile.email},${data.cycle},${data.userProfile.unit}\n\n`;
  
  // Sheet 2: Self Evaluation
  csvContent += '=== AUTOAVALIAÇÃO ===\n';
  csvContent += 'Critério,Descrição Geral,Autoavaliação (nota),Descrição da Nota,Dados e Fatos que Justificam\n';
  data.selfEvaluation.forEach(item => {
    csvContent += `"${item.criterion}","${item.generalDescription}",${item.selfEvaluation},"${item.scoreDescription}","${item.justification}"\n`;
  });
  csvContent += '\n';
  
  // Sheet 3: 360 Evaluation
  csvContent += '=== AVALIAÇÃO 360 ===\n';
  csvContent += 'Email do avaliado (primeiro.último),Projetos que trabalharam juntos,Período,Motivado a trabalhar novamente,Nota geral para o funcionário,Pontos para melhoria,Pontos fortes e que podem ser explorados\n';
  data.peerEvaluations.forEach(item => {
    csvContent += `"${item.evaluatorEmail}","${item.projects}","${item.period}","${item.motivatedToWorkAgain}",${item.overallGrade},"${item.improvementPoints}","${item.strengths}"\n`;
  });
  csvContent += '\n';
  
  // Sheet 4: Reference Search
  csvContent += '=== PESQUISA DE REFERÊNCIA ===\n';
  csvContent += 'Email da referência (primeiro.último),Justificativa\n';
  data.references.forEach(item => {
    csvContent += `"${item.referenceEmail}","${item.justification}"\n`;
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
      },
      {
        evaluatorEmail: 'pedro.oliveira@empresa.com',
        evaluatorName: 'Pedro Oliveira',
        projects: 'Sistema de Notificações, Cache Distribuído, Monitoramento',
        period: '4 meses',
        motivatedToWorkAgain: 'Sim',
        overallGrade: 4.2,
        improvementPoints: 'Poderia melhorar a apresentação de ideias em reuniões e ser mais paciente com desenvolvedores júnior',
        strengths: 'Muito experiente, compartilha conhecimento, tem boa visão de produto, é um bom mentor'
      },
      {
        evaluatorEmail: 'ana.costa@empresa.com',
        evaluatorName: 'Ana Costa',
        projects: 'Sistema de Usuários, Autenticação OAuth, Logs Centralizados',
        period: '5 meses',
        motivatedToWorkAgain: 'Sim',
        overallGrade: 4.1,
        improvementPoints: 'Poderia ser mais direto na comunicação e melhorar a gestão de tempo em projetos complexos',
        strengths: 'Muito organizado, entrega sempre no prazo, tem boa qualidade de código, é confiável'
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
      },
      {
        referenceEmail: 'roberto.almeida@empresa.com',
        referenceName: 'Roberto Almeida',
        justification: 'Profissional dedicado e comprometido com a qualidade. Sempre busca a excelência em suas entregas e contribui positivamente para o ambiente de trabalho.'
      },
      {
        referenceEmail: 'fernanda.lima@empresa.com',
        referenceName: 'Fernanda Lima',
        justification: 'Muito responsável e organizado. Sempre cumpre os prazos e mantém boa comunicação com a equipe. É um profissional confiável e competente.'
      }
    ]
  };
};

// Function to transform backend data to export format
export const transformBackendDataToExport = (backendData: any): EvaluationData => {
  // Extract user profile
  const userProfile: UserProfile = {
    id: backendData.id,
    name: backendData.name,
    email: backendData.email || `${backendData.name.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
    unit: backendData.unit?.name || 'Engenharia',
    position: backendData.position?.name || 'Desenvolvedor',
    track: backendData.track?.name || 'Backend'
  };

  // Extract self evaluation data
  const selfEvaluation: SelfEvaluationItem[] = backendData.selfEvaluations?.[0]?.items?.map((item: any) => ({
    criterion: item.criterion?.name || 'Critério não informado',
    generalDescription: item.criterion?.generalDescription || 'Descrição não disponível',
    selfEvaluation: item.score || 0,
    scoreDescription: getScoreDescription(item.score),
    justification: item.justification || 'Justificativa não disponível'
  })) || [];

  // Extract peer evaluation data
  const peerEvaluations: PeerEvaluation[] = backendData.peerEvaluationsReceived?.map((evaluation: any) => ({
    evaluatorEmail: evaluation.evaluator?.email || `${evaluation.evaluator?.name?.toLowerCase().replace(/\s+/g, '.') || 'avaliador'}@empresa.com`,
    evaluatorName: evaluation.evaluator?.name || 'Avaliador não informado',
    projects: evaluation.projects?.map((p: any) => p.project?.name).join(', ') || 'Projetos não especificados',
    period: evaluation.projects?.map((p: any) => `${p.period} meses`).join(', ') || 'Período não especificado',
    motivatedToWorkAgain: evaluation.motivation || 'Não informado', // This should be mapped from backend if available
    overallGrade: evaluation.score || 0,
    improvementPoints: evaluation.improvements || 'Pontos de melhoria não especificados',
    strengths: evaluation.strengths || 'Pontos fortes não especificados'
  })) || [];

  // Extract references data
  const references: Reference[] = backendData.referencesReceived?.map((reference: any) => ({
    referenceEmail: reference.provider?.email || `${reference.provider?.name?.toLowerCase().replace(/\s+/g, '.') || 'referencia'}@empresa.com`,
    referenceName: reference.provider?.name || 'Referência não informada',
    justification: reference.justification || 'Justificativa não disponível'
  })) || [];

  // Get cycle information
  const cycle = backendData.finalScores?.[0]?.cycle?.name || 
                backendData.selfEvaluations?.[0]?.cycle?.name || 
                backendData.peerEvaluationsReceived?.[0]?.cycle?.name || 
                '2024.2';

  return {
    userProfile,
    selfEvaluation,
    peerEvaluations,
    references,
    cycle
  };
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