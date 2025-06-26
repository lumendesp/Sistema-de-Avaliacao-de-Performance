import { IsString, IsDateString, IsEnum } from 'class-validator';

export enum CycleStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
  PUBLISHED = 'PUBLISHED',
}

export class CreateCicloDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsEnum(CycleStatus)
  status: CycleStatus;
}
