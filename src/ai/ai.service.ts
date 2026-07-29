import { AIProvider } from './ai.provider';
import { GeminiAIProvider } from './gemini.provider';

export class AIService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || new GeminiAIProvider();
  }

  async generateCompletion(prompt: string, options?: any) {
    return this.provider.generateCompletion(prompt, options);
  }
}

export const aiService = new AIService();
