import { Controller, Get, Query, Param } from '@nestjs/common';
import { ManagerSearchBarService } from './manager-search-bar.service';

@Controller('manager-search-bar')
export class ManagerSearchBarController {
  constructor(private readonly managerSearchBarService: ManagerSearchBarService) {}

  @Get(':managerId')
  findManagerCollaborators(
    @Param('managerId') managerId: string,
    @Query('search') search: string
  ) {
    return this.managerSearchBarService.findManagerCollaborators(Number(managerId), search || "");
  }
}
