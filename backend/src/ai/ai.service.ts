import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || 'SUA_API_KEY',
  );

  // Pequeno delay para evitar erro 429 (Too Many Requests)
  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Prompt padrão
  async generate(prompt: string): Promise<string> {
    await this.sleep(1000); // delay de 1 segundo

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  // Prompt com configuração personalizada
  async generateWithConfig(
    prompt: string,
    temperature: number,
  ): Promise<string> {
    await this.sleep(1000); // delay de 1 segundo

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: { temperature },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
