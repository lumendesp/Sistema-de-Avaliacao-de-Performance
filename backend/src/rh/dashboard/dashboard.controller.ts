import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RHDashboardService } from './dashboard.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { RHDashboardDto } from './dto/rh-dashboard.dto';
import { RhCollaboratorDto } from './dto/rh-collaborator.dto';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('RH - Dashboard')
@Controller('rh/dashboard')
// @UseGuards(JwtAuthGuard, RolesGuard) // 
export class RHDashboardController {
    constructor(private readonly dashboardService: RHDashboardService) { }

    @Get('status')
    // @Roles('HR', 'ADMIN') //
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtém o status global das avaliações para o dashboard de RH' })
    @ApiResponse({ status: 200, description: 'Dados retornados com sucesso.', type: RHDashboardDto })
    @ApiResponse({ status: 404, description: 'Nenhum ciclo de avaliação ativo encontrado.' })
    @ApiQuery({ name: 'cycleId', required: false, type: Number, description: 'ID do ciclo de avaliação para filtrar os dados.' })
    async getRHDashboardStatus(@Query('cycleId') cycleId?: string) {
        const cycleIdNumber = cycleId ? parseInt(cycleId, 10) : undefined;
        return this.dashboardService.getRHDashboardStatus(cycleIdNumber);
    }

    @Get('collaborators')
    // @UseGuards(...) e @Roles(...) viriam aqui
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtém a lista de colaboradores para a página de RH' })
    @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.', type: [RhCollaboratorDto] })
    @ApiQuery({ name: 'cycleId', required: false, type: Number })
    async getCollaborators(@Query('cycleId') cycleId?: string) {
        const cycleIdNumber = cycleId ? parseInt(cycleId, 10) : undefined;
        return this.dashboardService.getCollaboratorsList(cycleIdNumber);
    }
}