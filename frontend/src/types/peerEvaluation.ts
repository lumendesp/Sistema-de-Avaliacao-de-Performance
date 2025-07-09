export interface PeerEvaluation {
  id: number;
  evaluateeId: number;
  cycleId: number;
  strengths: string;
  improvements: string;
  motivation: string;
  score: number;
  projects: {
    project: {
      id: number;
      name: string;
    };
    period: number;
  }[];
  evaluatee: {
    id: number;
    name: string;
    email: string;
  };
}

export interface PeerEvaluationFormData {
  [collaboratorId: number]: {
    score?: number;
    strengths: string;
    improvements: string;
    motivation: string;
    projectName: string;
    projectPeriod: string;
  };
}

export interface PeerEvaluationFormProps {
  myEvaluations: PeerEvaluation[];
  setMyEvaluations: (evaluations: PeerEvaluation[]) => void;
  cycleId: number;
  isCycleFinished?: boolean;
}
