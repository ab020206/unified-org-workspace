export class MockLLMService {
  public static async generateSummary(prompt: string): Promise<{
    title: string;
    summary: string;
    modelUsed: string;
    tokenUsage: number;
  }> {
    return {
      title: 'Mocked AI Executive Digest',
      summary: `Automated test summary generated for prompt length ${prompt.length}. All tickets resolved and PR reviews completed successfully.`,
      modelUsed: 'mock-gemini-2.5-flash',
      tokenUsage: 128,
    };
  }
}
