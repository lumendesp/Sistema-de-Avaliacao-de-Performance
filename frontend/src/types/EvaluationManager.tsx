export interface EvaluationCriterion {
  id: number;
  title: string;
  selfRating: number;
  selfJustification: string;
  managerRating?: number;
  managerJustification?: string;
}
