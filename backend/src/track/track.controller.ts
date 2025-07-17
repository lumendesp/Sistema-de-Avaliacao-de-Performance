import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TrackService } from './track.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';

@ApiTags('tracks')
@Controller('tracks')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check for track module' })
  @ApiResponse({ status: 200, description: 'Track module is healthy' })
  async health() {
    try {
      // Test database connection
      const trackCount = await this.trackService['prisma'].track.count();
      return { 
        status: 'healthy', 
        message: 'Track module is working!', 
        timestamp: new Date().toISOString(),
        trackCount 
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
  @ApiOperation({ summary: 'Debug endpoint to check track state' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 200, description: 'Track debug info' })
  async debug(@Param('id') id: string) {
    try {
      const trackId = +id;
      
      // Check if track exists
      const track = await this.trackService.findOne(trackId);
      
      // Get related data
      const criterionGroups = await this.trackService['prisma'].criterionGroup.findMany({
        where: { trackId },
        include: {
          configuredCriteria: {
            include: {
              criterion: true
            }
          }
        }
      });
      
      return {
        track,
        criterionGroups,
        totalGroups: criterionGroups.length,
        totalCriteria: criterionGroups.reduce((sum, group) => sum + group.configuredCriteria.length, 0)
      };
    } catch (error) {
      console.error('Debug error:', error);
      return { error: error.message, stack: error.stack };
    }
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint to verify track module is working' })
  @ApiResponse({ status: 200, description: 'Track module is working' })
  test() {
    return { message: 'Track module is working!', timestamp: new Date().toISOString() };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new track' })
  @ApiResponse({ status: 201, description: 'Track created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createTrackDto: CreateTrackDto) {
    return this.trackService.create(createTrackDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tracks' })
  @ApiResponse({ status: 200, description: 'List of all tracks' })
  findAll() {
    return this.trackService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a track by id' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 200, description: 'Track found' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  findOne(@Param('id') id: string) {
    return this.trackService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a track' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 200, description: 'Track updated successfully' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(@Param('id') id: string, @Body() updateTrackDto: UpdateTrackDto) {
    try {
      return await this.trackService.update(+id, updateTrackDto);
    } catch (error) {
      console.error('Controller error updating track:', error);
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a track' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 204, description: 'Track deleted successfully' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  remove(@Param('id') id: string) {
    return this.trackService.remove(+id);
  }

  // Endpoints adicionais para gerenciar usuários nas tracks
  @Post(':id/users/:userId')
  @ApiOperation({ summary: 'Add user to track' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 201, description: 'User added to track successfully' })
  @ApiResponse({ status: 404, description: 'Track or user not found' })
  addUserToTrack(
    @Param('id') trackId: string,
    @Param('userId') userId: string,
  ) {
    return this.trackService.addUserToTrack(+trackId, +userId);
  }

  @Delete(':id/users/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove user from track' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User removed from track successfully' })
  @ApiResponse({ status: 404, description: 'Track or user not found' })
  removeUserFromTrack(
    @Param('id') trackId: string,
    @Param('userId') userId: string,
  ) {
    return this.trackService.removeUserFromTrack(+trackId, +userId);
  }

  @Get(':id/users')
  @ApiOperation({ summary: 'Get all users in a track' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 200, description: 'List of users in track' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  getTrackUsers(@Param('id') id: string) {
    return this.trackService.getTrackUsers(+id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get track history' })
  @ApiParam({ name: 'id', description: 'Track ID' })
  @ApiResponse({ status: 200, description: 'Track history' })
  @ApiResponse({ status: 404, description: 'Track not found' })
  getTrackHistory(@Param('id') id: string) {
    return this.trackService.getTrackHistory(+id);
  }
} 