import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { OkrService } from './okr.service';

@Controller('okrs')
export class OkrController {
  constructor(private readonly okrService: OkrService) {}

  @Get('user/:userId')
  getOkrsByUser(@Param('userId') userId: string) {
    return this.okrService.getOkrsByUser(Number(userId));
  }

  @Post()
  createOkr(@Body() body: { userId: number; objective: string; dueDate: string; keyResults: string[] }) {
    return this.okrService.createOkr(body);
  }

  @Patch(':id')
  updateOkr(@Param('id') id: string, @Body() body: { objective?: string; dueDate?: string; progress?: number; status?: string }) {
    return this.okrService.updateOkr(Number(id), body);
  }

  @Delete(':id')
  deleteOkr(@Param('id') id: string) {
    return this.okrService.deleteOkr(Number(id));
  }

  // KeyResult endpoints
  @Post(':okrId/key-result')
  addKeyResult(@Param('okrId') okrId: string, @Body() body: { description: string }) {
    return this.okrService.addKeyResult(Number(okrId), body.description);
  }

  @Patch('/key-result/:id')
  updateKeyResult(@Param('id') id: string, @Body() body: { description: string }) {
    return this.okrService.updateKeyResult(Number(id), body.description);
  }

  @Delete('/key-result/:id')
  deleteKeyResult(@Param('id') id: string) {
    return this.okrService.deleteKeyResult(Number(id));
  }
} 