import { Controller } from '@nestjs/common';
import { RhService } from './rh.service';

@Controller('rh')
export class RhController {
  constructor(private readonly rhService: RhService) {}
}
