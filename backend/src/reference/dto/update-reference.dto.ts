import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateReferenceDto {
  @IsString()
  @IsNotEmpty()
  justification!: string; // O `!` indica que será sempre definido
}
