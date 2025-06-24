import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CiclosService } from './ciclos.service';
import { CreateCicloDto } from './dto/create-ciclo.dto';
import { UpdateCicloDto } from './dto/update-ciclo.dto';

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

  @Get('historico/:userId')
  getHistoricoCiclos(@Param('userId') userId: string) {
    return this.ciclosService.getHistoricoCiclos(Number(userId));
  }
}
