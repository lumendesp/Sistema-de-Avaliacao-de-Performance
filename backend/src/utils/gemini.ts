import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateGeminiText(prompt: string): Promise<string> {
  // const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  // const result = await model.generateContent(prompt);
  // const response = await result.response;
  return '';
} 