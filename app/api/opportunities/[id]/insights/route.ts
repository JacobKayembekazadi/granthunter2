import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildOpportunityAnalysisContext } from '@/lib/ai/context/opportunity-analysis-context';
import { scoutPrompts } from '@/lib/ai/prompts/scout-prompts';
import { generateWithModel } from '@/lib/ai/orchestrator';
import { getCached, setCached } from '@/lib/redis';
import { OpportunityAnalysis } from '@/types/dashboard';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache (cache for 1 hour)
    const cacheKey = `opportunity_insights:${id}`;
    const cached = await getCached<OpportunityAnalysis>(cacheKey);
    if (cached) {
      return NextResponse.json({ analysis: cached });
    }

    // Build context
    const context = await buildOpportunityAnalysisContext(id);

    // Prepare opportunity data for AI analysis
    const opportunityData = `
Title: ${context.opportunity.title}
Agency: ${context.opportunity.agency}
Value: ${context.opportunity.value || 'Not specified'}
Due Date: ${context.opportunity.dueDate || 'Not specified'}
NAICS Code: ${context.opportunity.naicsCode || 'Not specified'}
Match Score: ${context.opportunity.matchScore}%
Description: ${context.opportunity.description || 'No description available'}
${context.rfpContent ? `\nRFP Content:\n${context.rfpContent.substring(0, 2000)}` : ''}

Similar Past Performance:
${context.similarPastPerformance
  .map((pp, i) => `${i + 1}. ${pp.title} (${pp.agency}) - Relevance: ${(pp.score * 100).toFixed(1)}%`)
  .join('\n')}

Similar Opportunities:
${context.similarOpportunities
  .map((opp, i) => `${i + 1}. ${opp.title} - Match: ${opp.matchScore}%`)
  .join('\n')}

Agency Patterns:
- Total opportunities with this agency: ${context.agencyPatterns.totalWithAgency}
- Average match score: ${context.agencyPatterns.averageMatchScore}%
    `.trim();

    // Generate analysis using Scout model
    const analysisPrompt = scoutPrompts.analyzeOpportunity(opportunityData);
    
    const aiResponse = await generateWithModel({
      role: 'scout',
      prompt: analysisPrompt,
      temperature: 0.7,
      maxTokens: 1500,
    });

    // Parse JSON response
    let analysis: OpportunityAnalysis;
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse;
      const parsed = JSON.parse(jsonString);

      analysis = {
        winProbability: parsed.matchScore || context.opportunity.matchScore,
        riskAssessment: {
          level: parsed.riskLevel || 'Medium',
          reasoning: parsed.complianceNotes || 'Analysis based on opportunity data and similar patterns.',
          factors: parsed.keyRequirements || [],
        },
        complianceStatus: {
          isCompliant: true, // Would be determined by editor model
          score: 85, // Placeholder
          issues: [],
        },
        recommendedActions: [
          'Review RFP requirements thoroughly',
          'Gather relevant past performance examples',
          'Identify key technical requirements',
        ],
        matchExplanation: `This opportunity has a ${context.opportunity.matchScore}% match score based on similar past performance and agency patterns.`,
        similarOpportunities: context.similarOpportunities,
      };
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Return default analysis if parsing fails
      analysis = {
        winProbability: context.opportunity.matchScore,
        riskAssessment: {
          level: 'Medium',
          reasoning: 'Analysis based on opportunity characteristics and agency patterns.',
          factors: [],
        },
        complianceStatus: {
          isCompliant: true,
          score: 85,
          issues: [],
        },
        recommendedActions: [
          'Review full RFP document',
          'Assess technical requirements',
          'Evaluate past performance alignment',
        ],
        matchExplanation: `This opportunity has a ${context.opportunity.matchScore}% match score.`,
        similarOpportunities: context.similarOpportunities,
      };
    }

    // Cache results
    await setCached(cacheKey, analysis, 3600); // 1 hour

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error generating opportunity insights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



