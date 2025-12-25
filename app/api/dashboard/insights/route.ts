import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildDashboardInsightsContext } from '@/lib/ai/context/dashboard-insights-context';
import { dashboardPrompts } from '@/lib/ai/prompts/dashboard-prompts';
import { generateWithModel } from '@/lib/ai/orchestrator';
import { getCached, setCached } from '@/lib/redis';
import { DashboardInsight } from '@/types/dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache (cache for 1 hour)
    const cacheKey = `dashboard_insights:${user.id}`;
    const cached = await getCached<DashboardInsight[]>(cacheKey);
    if (cached) {
      return NextResponse.json({ insights: cached });
    }

    // Build context
    const context = await buildDashboardInsightsContext(user.id);

    // Generate prompt
    const prompt = dashboardPrompts.generateInsights(context);

    // Generate insights using AI (using architect role for reasoning)
    const aiResponse = await generateWithModel({
      role: 'architect',
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Parse JSON response
    let insights: DashboardInsight[];
    try {
      // Extract JSON from response (remove markdown code blocks if present)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      const parsed = JSON.parse(jsonString);

      insights = parsed.map((insight: any, index: number) => ({
        id: `insight-${Date.now()}-${index}`,
        type: insight.type || 'opportunity',
        title: insight.title || 'Untitled Insight',
        description: insight.description || '',
        confidence: typeof insight.confidence === 'number' ? insight.confidence : 75,
        actionUrl: insight.actionUrl,
        priority: insight.priority || 'medium',
      }));
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Return default insights if parsing fails
      insights = [
        {
          id: 'insight-fallback-1',
          type: 'opportunity',
          title: 'Review High-Match Opportunities',
          description: `You have ${context.opportunities.highMatch.length} opportunities with match scores above 80%. Consider prioritizing these for proposal development.`,
          confidence: 85,
          priority: 'high',
        },
      ];
    }

    // Cache results
    await setCached(cacheKey, insights, 3600); // 1 hour

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating dashboard insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

