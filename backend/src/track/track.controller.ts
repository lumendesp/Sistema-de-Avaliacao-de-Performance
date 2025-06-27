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
  update(@Param('id') id: string, @Body() updateTrackDto: UpdateTrackDto) {
    return this.trackService.update(+id, updateTrackDto);
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