import type { Mentor } from "./mentor";

export type MentorEvaluationProps = {
  evaluateeId: number;
  mentor: Mentor;
  mentorEvaluation?: any;
  setMentorEvaluation?: (evaluation: any) => void;
  cycleId: number;
  isCycleFinished?: boolean;
};

export type MentorEvaluation = {
  id: number;
  evaluatorEmail?: string;
  evaluatorName?: string;
  score?: number;
  scoreDescription?: string;
  justification?: string;
};
