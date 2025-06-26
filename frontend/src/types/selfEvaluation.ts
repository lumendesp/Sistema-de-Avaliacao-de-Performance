export interface Criterion {
  id: number;
  title: string;
  description?: string;
  score?: number;
  justification?: string;
}

export interface SelfEvaluationFormProps {
  title: string;
  criteria: Criterion[];
  readOnly?: boolean;
  cycleId: number;  
  previousAnswers?: {
    criterionId: number;
    score: number;
    justification: string;
    cycleId: number;  
  }[];
}

export interface SelfEvaluationItemProps {
  index: number;
  title: string;
  description?: string;
  score: number;
  setScore: (value: number) => void;
  justification: string;
  setJustification: (value: string) => void;
  readOnly?: boolean;
}
