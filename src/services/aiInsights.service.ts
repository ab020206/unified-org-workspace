import { auditAnalyticsService } from './auditAnalytics.service';
import { PromptManager } from '../ai/prompt.manager';
import { GeminiAIProvider } from '../ai/gemini.provider';
import { logger } from '../utils/logger';

export class AIInsightsService {
  private promptManager: PromptManager;

  constructor() {
    this.promptManager = new PromptManager();
  }

  async generateExecutiveInsights(
    scopedOrgId?: string | null,
    userRole = 'ADMIN'
  ): Promise<string[]> {
    const stats = await auditAnalyticsService.getAnalyticsSummary({}, scopedOrgId, userRole);

    const insights: string[] = [];

    // Rule & LLM based insight summaries
    if (stats.ticketsCreated > 0) {
      insights.push(
        `Support ticket activity reached ${stats.ticketsCreated} new tickets logged across the workspace.`
      );
    } else {
      insights.push('Support ticket volume remains steady with clean operational health.');
    }

    if (stats.reviewsCreated > 0 || stats.reviewsApproved > 0) {
      insights.push(
        `Reviewer workload: ${stats.reviewsCreated} pull requests submitted and ${stats.reviewsApproved} approvals registered.`
      );
    }

    if (stats.mostActiveUsers.length > 0) {
      const topUser = stats.mostActiveUsers[0];
      insights.push(
        `User ${topUser.email} performed ${topUser.actionCount} workspace operations, leading activity.`
      );
    }

    if (stats.permissionChanges > 0) {
      insights.push(
        `Security Alert: ${stats.permissionChanges} permission policy adjustments made. Recommend auditing role overrides.`
      );
    }

    if (stats.featureFlagChanges > 0) {
      insights.push(
        `System Configuration: ${stats.featureFlagChanges} feature flag toggles updated.`
      );
    }

    // Try AI generation via PromptManager / Gemini if key present
    if (
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'your-production-gemini-api-key-here'
    ) {
      try {
        const provider = new GeminiAIProvider();
        const prompt = `Synthesize these enterprise workspace metrics into 3 concise executive insights:\n${JSON.stringify(stats)}`;
        const aiResponse = await provider.generateCompletion(prompt);
        if (aiResponse && aiResponse.text) {
          const aiLines = aiResponse.text.split('\n').filter((l: string) => l.trim().length > 0);
          return aiLines;
        }
      } catch (err: any) {
        logger.warn({ error: err.message }, 'Gemini AI Insights fallback to rule-based synthesis');
      }
    }

    return insights;
  }
}

export const aiInsightsService = new AIInsightsService();
