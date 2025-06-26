import { Controller, Get, Param, Put } from '@nestjs/common';
import { MentorService } from './mentor.service';

@Controller('mentors')
export class MentorController {
  constructor(private readonly mentorService: MentorService) {}

  // retorna todos os usuários que tem papel de mentor
  @Get()
  async findAll() {
    return this.mentorService.findAll();
  }

  // retorna o mentor buscado pelo id e a lista dos seus mentorados
  @Get(':mentorId')
  async getMentorWithMentees(@Param('mentorId') mentorId: string) {
    return await this.mentorService.getMentorWithMentees(+mentorId);
  }

  // atualiza o mentorId de um usuário para associar o mentor a ele
  @Put(':mentorId/assign/:userId')
  async assignMentee(
    @Param('mentorId') mentorId: string,
    @Param('userId') userId: string,
  ) {
    return await this.mentorService.assignMentee(+mentorId, +userId);
  }

  // remove o mentor de um usuário
  @Put(':mentorId/unassign/:userId')
  async unassignMentee(
    @Param('mentorId') mentorId: string,
    @Param('userId') userId: string,
  ) {
    return await this.mentorService.unassignMentee(+mentorId, +userId);
  }
}
