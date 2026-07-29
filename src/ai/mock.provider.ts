import { AIProvider, AICompletionResult } from './ai.provider';

export class MockAIProvider extends AIProvider {
  readonly name = 'MockAI';

  async generateCompletion(prompt: string, _options?: any): Promise<AICompletionResult> {
    // Generate intelligent structured summary from prompt context
    const lines = prompt.split('\n');
    const userName =
      lines
        .find((l) => l.startsWith('User:'))
        ?.replace('User:', '')
        .trim() || 'Team Member';
    const orgName =
      lines
        .find((l) => l.startsWith('Organization:'))
        ?.replace('Organization:', '')
        .trim() || 'Workspace';

    const ticketCountMatch = prompt.match(/Assigned Tickets \((\d+)\):/);
    const prCountMatch = prompt.match(/PRs Awaiting Review \((\d+)\):/);

    const ticketCount = ticketCountMatch ? parseInt(ticketCountMatch[1], 10) : 0;
    const prCount = prCountMatch ? parseInt(prCountMatch[1], 10) : 0;

    const summary = `### 🌟 Executive AI Briefing for ${userName} (${orgName})

**Overview**: Here is your personalized activity briefing generated asynchronously for **${orgName}**.

#### 🎫 Support Hub Highlights
- You currently have **${ticketCount} assigned tickets** requiring your attention.
- Prioritize high-severity issues and ensure resolution timeline SLAs are met.

#### 🔀 Review Console Status
- There are **${prCount} Pull Requests awaiting review** or pending merge approvals.
- Conduct code reviews promptly to unblock ongoing feature deployments.

#### 💡 Recommended Actions
1. Review active pull request diffs and leave constructive review decisions.
2. Update open ticket statuses and add progress notes for team visibility.
3. Collaborate with connected external organizations on shared cross-tenant items.`;

    return {
      text: summary,
      tokenUsage: 350,
      model: 'mock-llm-v1',
    };
  }
}
