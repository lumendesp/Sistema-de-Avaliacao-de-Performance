import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CiclosService } from './ciclos.service';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('ciclos')
export class CiclosController {
  constructor(private readonly ciclosService: CiclosService) {}

  @Post()
  create(@Body() createCicloDto: CreateCicloDto) {
    return this.ciclosService.create(createCicloDto);
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
  @Get('brutal-facts')
  getBrutalFactsData() {
    return this.ciclosService.getBrutalFactsData();
  }

  @UseGuards(JwtAuthGuard)
  @Get('debug/cycles')
  getDebugCycles() {
    return this.ciclosService.getDebugCycles();
  }

  @UseGuards(JwtAuthGuard)
  @Get('current')
  getCurrentCycle(@Query('type') type?: string) {
    // Validar se o tipo é válido
    if (type && !Object.values(Role).includes(type as Role)) {
      throw new Error(`Invalid role type: ${type}`);
    }
    
    return this.ciclosService.getCurrentCycle(type as Role);
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
