import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCicloDto, CycleStatus } from './create-ciclo.dto';

export class UpdateCicloDto extends PartialType(CreateCicloDto) {
  @ApiPropertyOptional({ example: 'CLOSED', enum: CycleStatus, description: 'Status do ciclo' })
  status?: CycleStatus;
}
