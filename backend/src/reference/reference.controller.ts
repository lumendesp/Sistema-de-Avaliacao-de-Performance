import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Request,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ReferenceService } from './reference.service';
import { CreateReferenceDto } from './dto/create-reference.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('References')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('references')
export class ReferenceController {
  constructor(private readonly referenceService: ReferenceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reference' })
  @ApiResponse({ status: 201, description: 'Reference successfully created.' })
  create(@Body() dto: CreateReferenceDto, @Request() req) {
    const providerId = req.user.userId;
    return this.referenceService.createReference(providerId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a reference' })
  @ApiResponse({ status: 200, description: 'Reference updated successfully.' })
  updateReference(
    @Param('id') id: string,
    @Body() dto: CreateReferenceDto, // pode reutilizar
    @Request() req,
  ) {
    const providerId = req.user.userId;
    return this.referenceService.updateReference(+id, providerId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a reference' })
  @ApiResponse({ status: 200, description: 'Reference deleted successfully.' })
  deleteReference(@Param('id') id: string, @Request() req) {
    const providerId = req.user.userId;
    return this.referenceService.deleteReference(+id, providerId);
  }

  @Get('cycle/:cycleId')
  @ApiOperation({ summary: 'Get all references by cycle' })
  getByCycle(@Param('cycleId') cycleId: string) {
    return this.referenceService.getReferencesByCycle(+cycleId);
  }

  @Get('cycle/:cycleId/user/:userId')
  @ApiOperation({
    summary: 'Get all references in a cycle by user (provider or receiver)',
  })
  @Get('cycle/:cycleId/sent/:userId')
  @ApiOperation({ summary: 'Get references sent by user in a cycle' })
  getSentReferences(
    @Param('cycleId') cycleId: string,
    @Param('userId') userId: string,
  ) {
    return this.referenceService.getSentReferencesByCycle(+cycleId, +userId);
  }

  @Get('cycle/:cycleId/received/:userId')
  @ApiOperation({ summary: 'Get references received by user in a cycle' })
  getReceivedReferences(
    @Param('cycleId') cycleId: string,
    @Param('userId') userId: string,
  ) {
    return this.referenceService.getReceivedReferencesByCycle(
      +cycleId,
      +userId,
    );
  }

  @Get('me')
  async getMyReferences(@Request() req, @Query('cycleId') cycleId: number) {
    const providerId = req.user.userId;
    return this.referenceService.findAllByProviderAndCycle(providerId, cycleId);
  }
}
