export interface Criterion {
  title: string;
}

export interface SelfEvaluationFormProps {
  title: string;
  criteria: Criterion[];
}

export interface SelfEvaluationItemProps {
  index: number;
  title: string;
  score: number;
  setScore: (value: number) => void;
  justification: string;
  setJustification: (value: string) => void;
}
