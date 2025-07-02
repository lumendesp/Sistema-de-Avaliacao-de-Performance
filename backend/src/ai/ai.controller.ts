import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { GeminiService } from './ai.service';
import { GenerateCustomDto } from './dto/generateCustomDto.dto';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  // GET /gemini?prompt=...
  @Get()
  async generateGet(@Query('prompt') prompt: string) {
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }

    const result = await this.geminiService.generate(prompt);
    return { result };
  }

  // POST /gemini/custom
  @Post('custom')
  async generateCustom(@Body() body: GenerateCustomDto){
    const { prompt, temperature = 0.7 } = body;

    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }

    const result = await this.geminiService.generateWithConfig(
      prompt,
      temperature,
    );
    return { result };
  }
}
