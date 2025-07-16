// types/survey.ts
export interface Survey {
  id: number;
  title: string;
  status: "aberta" | "fechada";
  averageScore: number;
}
