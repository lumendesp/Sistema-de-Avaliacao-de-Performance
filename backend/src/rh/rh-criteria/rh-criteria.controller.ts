import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { RhCriteriaService } from './rh-criteria.service';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import { UpdateCriterionDto } from './dto/update-criterion.dto';
import { CreateConfiguredCriterionDto } from './dto/create-configured-criterion.dto';

@ApiTags('rh-criteria')
@Controller('rh-criteria')
export class RhCriteriaController {
    constructor(private readonly service: RhCriteriaService) {}

    @Post()
    @ApiOperation({ summary: 'Criar um novo critério' })
    @ApiResponse({ status: 201, description: 'Critério criado com sucesso' })
    @ApiBody({ type: CreateCriterionDto })
    create(@Body() dto: CreateCriterionDto) {
        return this.service.createCriterion(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os critérios' })
    @ApiResponse({ status: 200, description: 'Lista de critérios' })
    findAll() {
        return this.service.getAllCriteria();
    }

    @Post('populate')
    @ApiOperation({ summary: 'Popular todos os critérios do enum' })
    @ApiResponse({ status: 201, description: 'Critérios populados com sucesso' })
    populateCriteria() {
        return this.service.populateCriteria();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Buscar critério por ID' })
    @ApiParam({ name: 'id', description: 'ID do critério' })
    @ApiResponse({ status: 200, description: 'Critério encontrado' })
    @ApiResponse({ status: 404, description: 'Critério não encontrado' })
    findOne(@Param('id') id: string) {
        return this.service.getCriterionById(Number(id));
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar critério' })
    @ApiParam({ name: 'id', description: 'ID do critério' })
    @ApiBody({ type: UpdateCriterionDto })
    @ApiResponse({ status: 200, description: 'Critério atualizado' })
    update(@Param('id') id: string, @Body() dto: UpdateCriterionDto) {
        return this.service.updateCriterion(Number(id), dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remover critério (soft delete)' })
    @ApiParam({ name: 'id', description: 'ID do critério' })
    @ApiResponse({ status: 200, description: 'Critério removido (soft delete)' })
    remove(@Param('id') id: string) {
        return this.service.deleteCriterion(Number(id));
    }

    // ConfiguredCriterion endpoints
    @Post('configured')
    @ApiOperation({ summary: 'Criar um critério configurado' })
    @ApiResponse({ status: 201, description: 'Critério configurado criado com sucesso' })
    @ApiBody({ type: CreateConfiguredCriterionDto })
    createConfiguredCriterion(@Body() dto: CreateConfiguredCriterionDto) {
        return this.service.addConfiguredCriterion(dto);
    }

    @Get('configured/all')
    @ApiOperation({ summary: 'Listar todos os critérios configurados' })
    @ApiResponse({ status: 200, description: 'Lista de critérios configurados' })
    findAllConfiguredCriteria() {
        return this.service.getConfiguredCriteria();
    }

    // Track-specific endpoints
    @Get('track/:trackId')
    @ApiOperation({ summary: 'Listar critérios configurados para uma trilha' })
    @ApiParam({ name: 'trackId', description: 'ID da trilha' })
    @ApiResponse({ status: 200, description: 'Lista de critérios da trilha' })
    getCriteriaByTrack(@Param('trackId') trackId: string) {
        return this.service.getCriteriaByTrack(Number(trackId));
    }

    @Get('tracks/with-criteria')
    @ApiOperation({ summary: 'Listar todas as trilhas com seus grupos de critérios e critérios organizados' })
    @ApiResponse({ status: 200, description: 'Lista de trilhas com critérios organizados' })
    getTracksWithCriteria() {
        return this.service.getTracksWithCriteria();
    }

    @Post('track/:trackId/criterion/:criterionId')
    @ApiOperation({ summary: 'Associar critério a uma trilha' })
    @ApiParam({ name: 'trackId', description: 'ID da trilha' })
    @ApiParam({ name: 'criterionId', description: 'ID do critério' })
    @ApiBody({ 
        schema: { 
            properties: { 
                groupId: { type: 'number' }, 
                unitId: { type: 'number' }, 
                positionId: { type: 'number' }, 
                mandatory: { type: 'boolean', default: false } 
            },
            required: ['groupId', 'unitId', 'positionId', 'mandatory']
        } 
    })
    @ApiResponse({ status: 201, description: 'Critério associado à trilha' })
    addCriterionToTrack(
        @Param('trackId') trackId: string,
        @Param('criterionId') criterionId: string,
        @Body() data: { groupId: number; unitId: number; positionId: number; mandatory: boolean }
    ) {
        return this.service.addCriterionToTrack(
            Number(trackId),
            Number(criterionId),
            data.groupId,
            data.unitId,
            data.positionId,
            data.mandatory
        );
    }

    @Delete('track/:trackId/criterion/:criterionId')
    @ApiOperation({ summary: 'Remover associação de critério com trilha' })
    @ApiParam({ name: 'trackId', description: 'ID da trilha' })
    @ApiParam({ name: 'criterionId', description: 'ID do critério' })
    @ApiResponse({ status: 200, description: 'Associação removida' })
    removeCriterionFromTrack(
        @Param('trackId') trackId: string,
        @Param('criterionId') criterionId: string
    ) {
        return this.service.removeCriterionFromTrack(Number(trackId), Number(criterionId));
    }

    @Patch('track/:trackId/criterion/:criterionId')
    @ApiOperation({ summary: 'Atualizar associação de critério com trilha' })
    @ApiParam({ name: 'trackId', description: 'ID da trilha' })
    @ApiParam({ name: 'criterionId', description: 'ID do critério' })
    @ApiBody({ 
        schema: { 
            properties: { 
                mandatory: { type: 'boolean' }, 
                unitId: { type: 'number' }, 
                positionId: { type: 'number' } 
            } 
        } 
    })
    @ApiResponse({ status: 200, description: 'Associação atualizada' })
    updateCriterionInTrack(
        @Param('trackId') trackId: string,
        @Param('criterionId') criterionId: string,
        @Body() data: { mandatory?: boolean; unitId?: number; positionId?: number }
    ) {
        return this.service.updateCriterionInTrack(Number(trackId), Number(criterionId), data);
    }

    @Post('track/:trackId/default-group')
    @ApiOperation({ summary: 'Criar grupo padrão para uma trilha' })
    @ApiParam({ name: 'trackId', description: 'ID da trilha' })
    @ApiBody({ 
        schema: { 
            properties: { 
                unitId: { type: 'number' }, 
                positionId: { type: 'number' } 
            },
            required: ['unitId', 'positionId']
        } 
    })
    @ApiResponse({ status: 201, description: 'Grupo padrão criado' })
    createDefaultGroup(
        @Param('trackId') trackId: string,
        @Body() data: { unitId: number; positionId: number }
    ) {
        return this.service.createDefaultGroup(Number(trackId), data.unitId, data.positionId);
    }
}
