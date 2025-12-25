import { DashboardContext } from '@/types/dashboard';

export const dashboardPrompts = {
  generateInsights: (context: DashboardContext) => `
You are an AI assistant analyzing a government contractor's dashboard. Your role is to provide actionable, strategic insights based on the data provided.

User Context:
- Name: ${context.user.name}
- Organization: ${context.user.org}

Current Opportunities:
- Total: ${context.opportunities.total}
- New: ${context.opportunities.byStatus.new || 0}
- Analyzing: ${context.opportunities.byStatus.analyzing || 0}
- Drafting: ${context.opportunities.byStatus.drafting || 0}
- Submitted: ${context.opportunities.byStatus.submitted || 0}
- High Match (80+): ${context.opportunities.highMatch.length}
- Upcoming Deadlines (7 days): ${context.opportunities.upcomingDeadlines.length}

Agency Distribution:
${Object.entries(context.opportunities.byAgency)
  .map(([agency, count]) => `- ${agency}: ${count}`)
  .join('\n')}

Active Proposals: ${context.proposals.active}
Completed Proposals: ${context.proposals.completed}
Proposal Completion Rate: ${context.proposals.metrics.completionRate.toFixed(1)}%

Active Search Agents: ${context.agents.active}
Recent Agent Runs: ${context.agents.recentRuns.length}

Past Performance Patterns:
- Top Agencies: ${context.pastPerformance.patterns.topAgencies.join(', ')}
- Historical Win Rate: ${context.pastPerformance.patterns.winRate.toFixed(1)}%

Relevant Past Performance Examples:
${context.pastPerformance.relevant
  .slice(0, 3)
  .map((pp, i) => `${i + 1}. ${pp.title} (${pp.agency})`)
  .join('\n')}

Generate 3-5 actionable insights. Each insight should have:
1. A clear, specific title (max 60 characters)
2. A detailed description explaining the insight and why it matters
3. A confidence score (0-100) based on data strength
4. A priority level (high/medium/low) based on urgency and impact
5. An optional actionUrl if the insight relates to a specific opportunity or feature

Focus on:
- Opportunities that need immediate attention (upcoming deadlines, high-match scores)
- Proposal pipeline gaps or bottlenecks
- Agent optimization opportunities
- Patterns that suggest strategic actions
- Risk areas or missed opportunities

Return ONLY valid JSON in this exact format:
[
  {
    "type": "opportunity" | "deadline" | "proposal" | "agent",
    "title": "string",
    "description": "string (2-3 sentences)",
    "confidence": number (0-100),
    "priority": "high" | "medium" | "low",
    "actionUrl": "string (optional)"
  }
]

Do not include any markdown formatting, code blocks, or additional text. Only return the JSON array.
`,
};
