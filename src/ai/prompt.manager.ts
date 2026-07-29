export class PromptManager {
  static buildDigestPrompt(data: {
    userName: string;
    orgName: string;
    assignedTickets: Array<{ id: string; title: string; priority: string; status: string }>;
    pendingReviews: Array<{ id: string; title: string; status: string }>;
    sharedResources: Array<{ resourceType: string; title?: string }>;
  }): string {
    return `Generate a executive summary digest for the following user in their organization:

User: ${data.userName}
Organization: ${data.orgName}

Assigned Tickets (${data.assignedTickets.length}):
${data.assignedTickets.map((t) => `- [${t.priority}] ${t.title} (${t.status})`).join('\n') || 'None'}

PRs Awaiting Review (${data.pendingReviews.length}):
${data.pendingReviews.map((pr) => `- ${pr.title} (${pr.status})`).join('\n') || 'None'}

Shared Cross-Org Resources (${data.sharedResources.length}):
${data.sharedResources.map((s) => `- ${s.resourceType}: ${s.title || 'Shared item'}`).join('\n') || 'None'}

Instructions:
1. Provide a professional, encouraging executive briefing.
2. Group into Support Hub Highlights, Review Console Status, and Recommended Actions.
3. Keep markdown formatting crisp and clean.`;
  }
}
