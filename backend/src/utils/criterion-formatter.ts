import { CriterionName } from '@prisma/client';

export function formatCriterionName(criterionName: CriterionName): string {
  return criterionName
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getCriterionDisplayName(criterionName: CriterionName): string {
  const formattedName = formatCriterionName(criterionName);
  
  // Mapeamento específico para nomes mais amigáveis
  const nameMapping: Record<CriterionName, string> = {
    [CriterionName.ORGANIZACAO_NO_TRABALHO]: 'Organização no Trabalho',
    [CriterionName.ATENDER_AOS_PRAZOS]: 'Atender aos Prazos',
    [CriterionName.SENTIMENTO_DE_DONO]: 'Sentimento de Dono',
    [CriterionName.RESILIENCIA_NAS_ADVERSIDADES]: 'Resiliência nas Adversidades',
    [CriterionName.CAPACIDADE_DE_APRENDER]: 'Capacidade de Aprender',
    [CriterionName.TEAM_PLAYER]: 'Team Player',
    [CriterionName.FAZER_MAIS_COM_MENOS]: 'Fazer Mais com Menos',
    [CriterionName.ENTREGAR_COM_QUALIDADE]: 'Entregar com Qualidade',
    [CriterionName.PENSAR_FORA_DA_CAIXA]: 'Pensar Fora da Caixa',
    [CriterionName.GENTE]: 'Gente',
    [CriterionName.RESULTADOS]: 'Resultados',
    [CriterionName.EVOLUCAO_DA_ROCKET_COR]: 'Evolução da Rocket Cor',
  };
  
  return nameMapping[criterionName] || formattedName;
} 