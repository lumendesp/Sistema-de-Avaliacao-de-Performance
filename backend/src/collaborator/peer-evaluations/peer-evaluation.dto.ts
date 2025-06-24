import { IsInt, IsString, Min, Max, Length } from 'class-validator';

export class CreatePeerEvaluationDto {
  @IsInt()
  evaluatorId: number;

  @IsInt()
  evaluateeId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  score: number;

  @IsString()
  @Length(5, 1000) 
  strengths: string;

  @IsString()
  @Length(5, 1000)
  improvements: string;
}
