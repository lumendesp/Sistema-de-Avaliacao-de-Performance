import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateReferenceDto {
  @IsString()
  @IsNotEmpty()
  justification!: string; 
}
