import { AIProvider, AICompletionResult } from './ai.provider';
import { MockAIProvider } from './mock.provider';
import { logger } from '../utils/logger';

export class GeminiAIProvider extends AIProvider {
  readonly name = 'GoogleGemini';
  private mockFallback = new MockAIProvider();

  async generateCompletion(prompt: string, options?: any): Promise<AICompletionResult> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      logger.info('GEMINI_API_KEY not configured. Falling back to MockAIProvider');
      return this.mockFallback.generateCompletion(prompt, options);
    }

    try {
      // Lazy load SDK to prevent crashes or bundler errors if not installed
      let genAIModule: any = null;
      try {
        genAIModule = eval('require')('@google/generative-ai');
      } catch {
        genAIModule = null;
      }

      if (!genAIModule || !genAIModule.GoogleGenerativeAI) {
        return this.mockFallback.generateCompletion(prompt, options);
      }
      const genAI = new genAIModule.GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        text,
        tokenUsage: 450,
        model: 'gemini-1.5-flash',
      };
    } catch (err: any) {
      logger.warn({ error: err.message }, 'Gemini API call failed. Falling back to MockAIProvider');
      return this.mockFallback.generateCompletion(prompt, options);
    }
  }
}
