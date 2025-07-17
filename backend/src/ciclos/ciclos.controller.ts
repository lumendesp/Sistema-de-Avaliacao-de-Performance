import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CiclosService } from './ciclos.service';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto, UpdateCycleStatusDto } from './dto/update-ciclo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CycleStatus } from '@prisma/client';
import { ApiOperation } from '@nestjs/swagger';

@Controller('ciclos')
export class CiclosController {
  constructor(private readonly ciclosService: CiclosService) {}

  @Post()
  create(@Body() createCicloDto: CreateCicloDto) {
    return this.ciclosService.create(createCicloDto);
  }

  // Removidas as rotas POST de fechamento e criação de ciclo subsequente

  @Patch(':id/status')
  async updateCycleStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateCycleStatusDto,
  ) {
    return this.ciclosService.updateCycleStatus(
      Number(id),
      updateStatusDto.status,
    );
  }

  @ApiOperation({
    summary:
      'Fecha o ciclo do colaborador e abre pro gestor/mentor (IN_PROGRESS_COLLABORATOR → IN_PROGRESS_MANAGER)',
  })
  @Patch('close-collaborator')
  async closeCollaboratorAndCreateManager() {
    return this.ciclosService.closeCollaboratorAndCreateManager();
  }

  // @Patch('close-manager')
  // async closeManagerAndCreateCommittee() {
  //   return this.ciclosService.closeManagerAndCreateCommittee();
  // }

  @ApiOperation({
    summary:
      'Fecha o ciclo do gestor/mentor e abre pra IA gerar os resumos (IN_PROGRESS_MANAGER → CLOSED)',
  })
  @Patch('close-manager')
  async closeManager() {
    return this.ciclosService.closeManager();
  }

  @ApiOperation({
    summary:
      'Fecha o "ciclo" da IA gerar os resumos e abre pro comitê (CLOSED → IN_PROGRESS_COMMITTEE)',
  })
  @Patch('open-committee')
  async openCommitteePhase() {
    return this.ciclosService.openCommitteePhase();
  }

  @ApiOperation({
    summary:
      'Fecha o ciclo do comitê e publica para todos (IN_PROGRESS_COMMITTEE → PUBLISHED)',
  })
  @Patch('close-committee')
  async closeCommittee() {
    return this.ciclosService.closeCommittee();
  }

  @Post('create-collaborator-cycle')
  async createCollaboratorCycle(
    @Body() cycleData?: { name?: string; startDate?: string; endDate?: string },
  ) {
    // Converter strings de data para Date se fornecidas
    const data = cycleData
      ? {
          ...cycleData,
          startDate: cycleData.startDate
            ? new Date(cycleData.startDate)
            : undefined,
          endDate: cycleData.endDate ? new Date(cycleData.endDate) : undefined,
        }
      : undefined;

    return this.ciclosService.createCollaboratorCycle(data);
  }

  @Get()
  findAll() {
    return this.ciclosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard/manager')
  getManagerDashboardStats(@Request() req) {
    return this.ciclosService.getManagerDashboardStats(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard/mentor')
  getMentorDashboardStats(@Request() req) {
    return this.ciclosService.getMentorDashboardStats(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('brutal-facts')
  getBrutalFactsData() {
    return this.ciclosService.getBrutalFactsData();
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  getCurrentCycle(@Query('status') status?: string) {
    // Validar se o status é válido
    if (status && !Object.values(CycleStatus).includes(status as CycleStatus)) {
      throw new Error(`Invalid cycle status: ${status}`);
    }

    return this.ciclosService.getCurrentCycle(status);
  }

  @UseGuards(JwtAuthGuard)
  @Get('historico/:userId')
  getHistoricoCiclos(@Param('userId') userId: string) {
    return this.ciclosService.getHistoricoCiclos(Number(userId));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ciclosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCicloDto: UpdateCicloDto) {
    return this.ciclosService.update(+id, updateCicloDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ciclosService.remove(+id);
  }
}
