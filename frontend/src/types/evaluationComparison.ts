export interface EvaluationComparisonItemProps {
  index: number;
  title: string;
  selfScore: number;
  finalScore: number;
  justification: string;
}

export interface EvaluationComparisonItemData {
  title: string;
  selfScore: number;
  finalScore: number;
  justification: string;
}

export interface SubmittedSelfEvaluationItem {
  id: number;
  criterionId: number;
  score: number;
  justification: string;
  scoreDescription: string;
  group: {
    id: number;
    name: string;
  } | null;
}
export interface EvaluationComparisonItemProps {
  index: number;
  title: string;
  selfScore: number;
  finalScore: number;
  justification: string;
}

export interface EvaluationComparisonItemData {
  criterionId: number;
  title: string;
  selfScore: number;
  finalScore: number;
  justification: string;
}

export interface SubmittedSelfEvaluationItem {
  id: number;
  criterionId: number;
  score: number;
  justification: string;
  scoreDescription: string;
  group: {
    id: number;
    name: string;
  } | null;
}
