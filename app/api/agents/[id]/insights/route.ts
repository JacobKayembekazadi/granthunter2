import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getGeminiClient } from '@/lib/ai/clients';
import { Type } from '@google/genai';

export async function POST(
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

    const body = await request.json();
    const { target } = body;

    if (!target) {
      return NextResponse.json({ error: 'Target is required' }, { status: 400 });
    }

    const geminiClient = getGeminiClient();
    const prompt = `Analyze this Government Contracting Search Target: "${target}". 
      Provide 2 advanced strategic suggestions for improving this search agent.
      Return exactly as a JSON array of objects with keys: title, description, confidence (0-100), reasoning, impact (High/Medium/Low), suggestedValue (the updated search string), marketIntel, historicalPrecedent (object with title, agency, value).`;

    const response = await geminiClient.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              impact: { type: Type.STRING },
              suggestedValue: { type: Type.STRING },
              marketIntel: { type: Type.STRING },
              historicalPrecedent: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  agency: { type: Type.STRING },
                  value: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const suggestions = JSON.parse(response.text || '[]');

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('Error generating insights:', error);
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

