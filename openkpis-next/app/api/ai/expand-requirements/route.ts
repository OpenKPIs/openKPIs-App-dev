import { NextRequest, NextResponse } from 'next/server';
import { getAISuggestions } from '@/lib/services/ai';

// Increase timeout for requirements expansion (up to 200 seconds)
export const maxDuration = 200;

// Helper to call OpenAI directly (similar to callOpenAI but exported)
async function callOpenAIDirect(prompt: string, systemPrompt: string = 'Return ONLY valid JSON, no markdown, no explanations.'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  // Determine which parameter to use based on model
  // Newer models (gpt-4o, gpt-4-turbo, o1, o3, etc.) use max_completion_tokens
  // Older models (gpt-3.5-turbo, gpt-4 without turbo/o) use max_tokens
  // Default to max_completion_tokens for most models (safer approach)
  const isOldModel = model.startsWith('gpt-3.5-turbo') || 
                     (model.startsWith('gpt-4') && !model.includes('turbo') && !model.includes('gpt-4o'));
  const isNewModel = !isOldModel;
  
  const requestBody: any = {
    model: model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
  };
  
  if (isNewModel) {
    requestBody.max_completion_tokens = 4000;
  } else {
    requestBody.max_tokens = 4000;
  }
  
  if (!model.includes('gpt-5') && !model.includes('o1') && !model.includes('o3')) {
    requestBody.temperature = 0.7;
  }
  
  // Add timeout using AbortController (120 seconds)
  const timeoutMs = 120000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error: any) {
    clearTimeout(timeoutId);
    // Handle timeout specifically
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      console.error('[Expand Requirements] Request timeout after', timeoutMs, 'ms');
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds. The AI model may be taking longer than expected. Please try again with shorter requirements or try a different model.`);
    }
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { requirements, analyticsSolution, platforms, kpiCount } = await request.json();

    if (!requirements || !analyticsSolution) {
      return NextResponse.json(
        { error: 'Requirements and analytics solution are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an analytics consultant specializing in ${analyticsSolution}.

User's raw requirement: "${requirements}"

Platforms: ${platforms?.join(', ') || 'Not specified'}

Expand this requirement into a structured analysis scope. Return ONLY valid JSON (no markdown, no explanations):

{
  "user_requirement_raw": "${requirements}",
  "ai_expanded": {
    "goal": "Clear business objective in 1-2 sentences",
    "questions": [
      "Key question 1 that this analysis should answer",
      "Key question 2",
      "Key question 3"
    ],
    "scope": ["Acquisition", "Activation", "Engagement", "Conversion", "Retention", "Revenue"],
    "time_horizon": "Recommended time period (e.g., 'Last 90 days with WoW and MoM comparisons')",
    "breakdowns": ["channel", "device", "country", "product_line", "segment"],
    "constraints": ["Event-based tracking", "PII-safe", "Real-time required"]
  }
}

Select relevant scope items, breakdowns, and constraints based on the requirement.`;

    const content = await callOpenAIDirect(prompt);
    
    // Extract JSON from markdown if present
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      const match = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonContent = match[1].trim();
      }
    }

    const parsed = JSON.parse(jsonContent);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('[API] Expand requirements error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to expand requirements' },
      { status: 500 }
    );
  }
}
