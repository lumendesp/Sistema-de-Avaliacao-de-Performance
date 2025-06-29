import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CriterionGroupService } from './criterion-group.service';
import { CreateCriterionGroupDto } from './dto/create-criterion-group.dto';
import { UpdateCriterionGroupDto } from './dto/update-criterion-group.dto';

@ApiTags('criterion-groups')
@Controller('criterion-groups')
export class CriterionGroupController {
  constructor(private readonly service: CriterionGroupService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo grupo de critérios' })
  @ApiBody({ type: CreateCriterionGroupDto })
  @ApiResponse({ status: 201, description: 'Grupo criado com sucesso' })
  create(@Body() dto: CreateCriterionGroupDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os grupos de critérios' })
  @ApiResponse({ status: 200, description: 'Lista de grupos' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar grupo por ID' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiResponse({ status: 200, description: 'Grupo encontrado' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar grupo de critérios' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiBody({ type: UpdateCriterionGroupDto })
  @ApiResponse({ status: 200, description: 'Grupo atualizado' })
  update(@Param('id') id: string, @Body() dto: UpdateCriterionGroupDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover grupo de critérios' })
  @ApiParam({ name: 'id', description: 'ID do grupo' })
  @ApiResponse({ status: 200, description: 'Grupo removido' })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
} 