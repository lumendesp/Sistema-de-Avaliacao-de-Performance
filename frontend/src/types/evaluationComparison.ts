export interface ComparisonCriterion {
  title: string;
}

export interface EvaluationComparisonItemProps {
  index: number;
  title: string;

  selfScore: number;
  finalScore: number;

  setSelfScore: (value: number) => void;

  justification: string;
  setJustification: (value: string) => void;
}

export interface EvaluationComparisonFormProps {
  title: string;
  criteria: ComparisonCriterion[];
}
