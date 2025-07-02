import { Controller, Get, Param, Put } from '@nestjs/common';
import { ManagerService } from './manager.service';

@Controller('managers')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  // retorna todos os usuários que tem papel de manager
  @Get()
  async findAll() {
    return this.managerService.findAll();
  }

  // retorna o manager buscado pelo id e a lista dos seus colaboradores
  @Get(':managerId')
  async getManagerWithCollaborators(@Param('managerId') managerId: string) {
    return await this.managerService.getManagerWithCollaborators(+managerId);
  }

  // associa um colaborador a um manager
  @Put(':managerId/assign/:userId')
  async assignCollaborator(
    @Param('managerId') managerId: string,
    @Param('userId') userId: string,
  ) {
    return await this.managerService.assignCollaborator(+managerId, +userId);
  }

  // remove a associação de um colaborador com um manager
  @Put(':managerId/unassign/:userId')
  async unassignCollaborator(
    @Param('managerId') managerId: string,
    @Param('userId') userId: string,
  ) {
    return await this.managerService.unassignCollaborator(+managerId, +userId);
  }
}
