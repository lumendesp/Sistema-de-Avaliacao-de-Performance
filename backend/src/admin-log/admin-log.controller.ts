import {
  Controller,
  Get,
  Query,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  ParseBoolPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AdminLogService, LogFilters } from './admin-log.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('admin-log')
@Controller('admin-log')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminLogController {
  constructor(private readonly adminLogService: AdminLogService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get system logs with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'List of system logs' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'userEmail', required: false, type: String })
  @ApiQuery({ name: 'method', required: false, type: String })
  @ApiQuery({ name: 'path', required: false, type: String })
  @ApiQuery({ name: 'ip', required: false, type: String })
  @ApiQuery({ name: 'responseStatus', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'errorOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLogs(
    @Query('userId') userId?: number,
    @Query('userEmail') userEmail?: string,
    @Query('method') method?: string,
    @Query('path') path?: string,
    @Query('ip') ip?: string,
    @Query('responseStatus') responseStatus?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('errorOnly') errorOnly?: boolean,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Request() req?: any,
  ) {
    const filters: LogFilters = {
      userId,
      userEmail,
      method,
      path,
      ip,
      responseStatus,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      errorOnly,
      page,
      limit,
    };

    const userRoles = Array.isArray(req.user?.roles) 
      ? req.user.roles.filter((r: any) => typeof r === 'string')
      : [];
    return this.adminLogService.getLogs(filters, userRoles);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get log statistics' })
  @ApiResponse({ status: 200, description: 'Log statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getLogStats(@Request() req: any) {
    const userRoles = Array.isArray(req.user?.roles) 
      ? req.user.roles.filter((r: any) => typeof r === 'string')
      : [];
    return this.adminLogService.getLogStats(userRoles);
  }

  @Get('recent')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get recent system logs' })
  @ApiResponse({ status: 200, description: 'Recent system logs' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of recent logs to return' })
  async getRecentLogs(
    @Query('limit') limit: number = 5,
    @Request() req: any,
  ) {
    const userRoles = Array.isArray(req.user?.roles) 
      ? req.user.roles.filter((r: any) => typeof r === 'string')
      : [];
    return this.adminLogService.getRecentLogs(limit, userRoles);
  }

  @Get('debug/user-info')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Debug endpoint to check user authentication and roles' })
  @ApiResponse({ status: 200, description: 'User information for debugging' })
  async debugUserInfo(@Request() req: any) {
    return {
      user: {
        id: req.user?.userId,
        email: req.user?.email,
        name: req.user?.name,
        roles: req.user?.roles,
        rolesType: typeof req.user?.roles,
        isArray: Array.isArray(req.user?.roles),
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('dashboard-stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getDashboardStats(@Request() req: any) {
    // Extract roles from JWT payload (they are stored as strings)
    const userRoles = Array.isArray(req.user?.roles) 
      ? req.user.roles.filter((r: any) => typeof r === 'string')
      : [];
    
    console.log('Controller Debug - User roles:', userRoles);
    console.log('Controller Debug - Full user object:', req.user);
    
    return this.adminLogService.getDashboardStats(userRoles);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get a specific log entry by ID' })
  @ApiResponse({ status: 200, description: 'Log entry details' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Log entry not found' })
  @ApiParam({ name: 'id', description: 'Log entry ID' })
  async getLogById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ) {
    const userRoles = Array.isArray(req.user?.roles) 
      ? req.user.roles.filter((r: any) => typeof r === 'string')
      : [];
    return this.adminLogService.getLogById(id, userRoles);
  }

  @Delete('cleanup')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete old logs' })
  @ApiResponse({ status: 200, description: 'Old logs deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiQuery({ name: 'daysToKeep', required: false, type: Number, description: 'Number of days to keep logs' })
  async deleteOldLogs(
    @Query('daysToKeep') daysToKeep: number = 30,
    @Request() req: any,
  ) {
    const userRoles = Array.isArray(req.user?.roles) 
      ? req.user.roles.filter((r: any) => typeof r === 'string')
      : [];
    return this.adminLogService.deleteOldLogs(daysToKeep, userRoles);
  }

  @Get('export/csv')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Export logs as CSV' })
  @ApiResponse({ status: 200, description: 'CSV export of logs' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async exportLogsCsv(
    @Query('userId') userId?: number,
    @Query('userEmail') userEmail?: string,
    @Query('method') method?: string,
    @Query('path') path?: string,
    @Query('ip') ip?: string,
    @Query('responseStatus') responseStatus?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('errorOnly') errorOnly?: boolean,
    @Request() req?: any,
  ) {
    const filters: LogFilters = {
      userId,
      userEmail,
      method,
      path,
      ip,
      responseStatus,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      errorOnly,
    };

    const userRoles = Array.isArray(req.user?.roles) 
      ? req.user.roles.filter((r: any) => typeof r === 'string')
      : [];
    const logs = await this.adminLogService.exportLogs(filters, userRoles);
    
    // Convert to CSV format
    const csvHeaders = [
      'ID', 'User ID', 'User Email', 'User Name', 'Action', 'Method', 'Path',
      'IP', 'User Agent', 'Request Body', 'Response Status', 'Response Time',
      'Error Message', 'Created At'
    ].join(',');

    const csvRows = logs.map(log => [
      log.id,
      log.userId || '',
      log.userEmail || '',
      log.userName || '',
      `"${log.action}"`,
      log.method,
      `"${log.path}"`,
      log.ip,
      `"${log.userAgent || ''}"`,
      `"${log.requestBody || ''}"`,
      log.responseStatus || '',
      log.responseTime || '',
      `"${log.errorMessage || ''}"`,
      log.createdAt.toISOString()
    ].join(','));

    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    return {
      content: csvContent,
      filename: `system-logs-${new Date().toISOString().split('T')[0]}.csv`,
      contentType: 'text/csv',
    };
  }
} 