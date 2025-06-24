export class CreateNotaDto {
  userId: number;
  cycleId: number;
  executionScore?: number;
  postureScore?: number;
  finalScore?: number;
  summary?: string;
  adjustedBy?: number;
  justification: string;
}
