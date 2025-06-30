export interface Criterion {
  id: number;
  title: string;
  description: string;
  score?: number;
  justification?: string;
}

export interface ConfiguredCriterion {
  id: number;
  criterionId: number;
  mandatory: boolean;
  criterion: {
    id: number;
    name: string;
    generalDescription: string;
    active: boolean;
    weight: number;
    displayName: string;
  };
}

export interface CriterionGroup {
  id: number;
  name: string;
  configuredCriteria: ConfiguredCriterion[];
}

export interface TrackWithGroups {
  id: number;
  name: string;
  CriterionGroup: CriterionGroup[];
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
