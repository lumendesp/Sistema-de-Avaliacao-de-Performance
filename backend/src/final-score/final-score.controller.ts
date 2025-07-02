import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FinalScoreService } from './final-score.service';
import { CreateFinalScoreDto } from './dto/create-final-score.dto';
import { UpdateFinalScoreDto } from './dto/update-final-score.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Final Score')
@Controller('final-score')
export class FinalScoreController {
  constructor(private readonly finalScoreService: FinalScoreService) {}

  @Post()
  create(@Body() createFinalScoreDto: CreateFinalScoreDto) {
    return this.finalScoreService.create(createFinalScoreDto);
  }

  @Get()
  findAll() {
    return this.finalScoreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.finalScoreService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFinalScoreDto: UpdateFinalScoreDto) {
    return this.finalScoreService.update(+id, updateFinalScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.finalScoreService.remove(+id);
  }

  @Get(':userId/:cycleId')
  async getFinalScoreByUserAndCycle(
    @Param('userId') userId: number,
    @Param('cycleId') cycleId: number
  ) {
    const score = await this.finalScoreService.findByUserAndCycle(Number(userId), Number(cycleId));
    if (!score) {
      return { message: 'Nota final não encontrada para esse usuário e ciclo.' };
    }
    return score;
  }
}
