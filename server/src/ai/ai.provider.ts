export interface AICompletionResult {
  text: string;
  tokenUsage: number;
  model: string;
}

export abstract class AIProvider {
  abstract readonly name: string;
  abstract generateCompletion(prompt: string, options?: any): Promise<AICompletionResult>;
}
