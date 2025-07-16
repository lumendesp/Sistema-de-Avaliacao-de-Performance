export enum MotivationLevel {
  CONCORDO_TOTALMENTE = "CONCORDO_TOTALMENTE",
  CONCORDO_PARCIALMENTE = "CONCORDO_PARCIALMENTE",
  DISCORDO_PARCIALMENTE = "DISCORDO_PARCIALMENTE",
  DISCORDO_TOTALMENTE = "DISCORDO_TOTALMENTE",
}

export const getMotivationLevelText = (level: string): string => {
  switch (level) {
    case MotivationLevel.CONCORDO_TOTALMENTE:
      return "Concordo Totalmente";
    case MotivationLevel.CONCORDO_PARCIALMENTE:
      return "Concordo Parcialmente";
    case MotivationLevel.DISCORDO_PARCIALMENTE:
      return "Discordo Parcialmente";
    case MotivationLevel.DISCORDO_TOTALMENTE:
      return "Discordo Totalmente";
    default:
      return level;
  }
};

export interface ClimateSurvey {
  id: number;
  title: string;
  description?: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  createdById: number;
  questions: ClimateSurveyQuestion[];
  _count?: {
    responses: number;
  };
}

export interface ClimateSurveyQuestion {
  id: number;
  text: string;
  surveyId: number;
}

export interface ClimateSurveyResponse {
  id: number;
  surveyId: number;
  hashId: string;
  createdAt: string;
  isSubmit: boolean;
  submittedAt?: string;
  answers: ClimateSurveyAnswer[];
}

export interface ClimateSurveyAnswer {
  id: number;
  questionId: number;
  responseId: number;
  level: string;
  justification: string;
  question: ClimateSurveyQuestion;
}

export interface CreateClimateSurveyData {
  title: string;
  description?: string;
  endDate: string;
  questions: { text: string }[];
}
