import { Controller, Get, Query } from '@nestjs/common';
import { CollaboratorsSearchBarService } from './collaborators-search-bar.service';

@Controller('collaborators-search-bar')
export class CollaboratorsSearchBarController {
  constructor(
    private readonly collaboratorsSearchBarService: CollaboratorsSearchBarService,
  ) {}

  @Get()
  findCollaborators(@Query('search') search: string) {
    // console.log('Busca:', search);
    return this.collaboratorsSearchBarService.findCollaborators(search);
  }
}
