import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { PdiService } from './pdi.service';
import { CreatePdiDto } from './dto/create-pdi.dto';
import { UpdatePdiDto } from './dto/update-pdi.dto';
import { CreatePdiActionDto } from './dto/create-pdi-action.dto';
import { UpdatePdiActionDto } from './dto/update-pdi-action.dto';

@Controller('pdi')
export class PdiController {
  constructor(private readonly pdiService: PdiService) {}

  @Get('user/:userId')
  getPdiByUser(@Param('userId') userId: string) {
    return this.pdiService.getPdiByUser(Number(userId));
  }

  @Post()
  createPdi(@Body() dto: CreatePdiDto) {
    return this.pdiService.createPdi(dto);
  }

  @Patch(':id')
  updatePdi(@Param('id') id: string, @Body() dto: UpdatePdiDto) {
    return this.pdiService.updatePdi(Number(id), dto);
  }

  @Delete(':id')
  deletePdi(@Param('id') id: string) {
    return this.pdiService.deletePdi(Number(id));
  }

  // CRUD para ações do PDI
  @Post('action')
  createPdiAction(@Body() dto: CreatePdiActionDto) {
    return this.pdiService.createPdiAction(dto);
  }

  @Patch('action/:id')
  updatePdiAction(@Param('id') id: string, @Body() dto: UpdatePdiActionDto) {
    return this.pdiService.updatePdiAction(Number(id), dto);
  }

  @Delete('action/:id')
  deletePdiAction(@Param('id') id: string) {
    return this.pdiService.deletePdiAction(Number(id));
  }
} 