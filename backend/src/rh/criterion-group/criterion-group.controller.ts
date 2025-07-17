import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CriterionGroupService } from './criterion-group.service';
import { CreateCriterionGroupDto } from './dto/create-criterion-group.dto';
import { UpdateCriterionGroupDto } from './dto/update-criterion-group.dto';

@ApiTags('criterion-groups')
@Controller('criterion-groups')
export class CriterionGroupController {
  constructor(private readonly service: CriterionGroupService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for criterion group module' })
  @ApiResponse({ status: 200, description: 'Criterion group module is healthy' })
  async health() {
    try {
      // Test database connection
      const groupCount = await this.service['prisma'].criterionGroup.count();
      const criteriaCount = await this.service['prisma'].configuredCriterion.count();
      return { 
        status: 'healthy', 
        message: 'Criterion group module is working!', 
        timestamp: new Date().toISOString(),
        groupCount,
        criteriaCount
      };
    } catch (error) {
      console.error('Health check error:', error);
      return { 
        status: 'unhealthy', 
        error: error.message, 
        timestamp: new Date().toISOString() 
      };
    }
  }

  @Get('debug/:id')
  @ApiOperation({ summary: 'Debug endpoint to check criterion group state' })
  @ApiParam({ name: 'id', description: 'Criterion Group ID' })
  @ApiResponse({ status: 200, description: 'Criterion group debug info' })
  async debug(@Param('id') id: string) {
    try {
      const groupId = Number(id);
      
      // Check if group exists
      const group = await this.service.findOne(groupId);
      
      // Get related data
      const configuredCriteria = await this.service['prisma'].configuredCriterion.findMany({
        where: { groupId },
        include: {
          criterion: true,
          track: true,
          unit: true,
          position: true
        }
      });
      
      return {
        group,
        configuredCriteria,
        totalCriteria: configuredCriteria.length
      };
    } catch (error) {
      console.error('Debug error:', error);
      return { error: error.message, stack: error.stack };
    }
  }

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
  @ApiResponse({ status: 404, description: 'Grupo não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  async remove(@Param('id') id: string) {
    try {
      return await this.service.remove(Number(id));
    } catch (error) {
      console.error('Controller error deleting criterion group:', error);
      throw error;
    }
  }
} 