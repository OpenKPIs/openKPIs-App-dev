import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { authorizeAIRequest, incrementAIUsage } from '@/lib/server/aiUsage';

export const maxDuration = 60;

type GenerateDataLayerRequest = {
  requirements: string;
  analyticsSolution: string;
  selectedItems: Record<string, unknown>;
  insights: Record<string, unknown>[];
  apiKey?: string;
  model?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateDataLayerRequest = await request.json();
    const { requirements, analyticsSolution, selectedItems, insights, apiKey, model } = body;

    const auth = await authorizeAIRequest(apiKey);
    if (auth.errorResponse) return auth.errorResponse;

    const baseURL = process.env.AGENT_API_BASE_URL || (process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : undefined);
    const modelName = model || process.env.AGENT_MODEL_NAME || (baseURL ? "qwen/qwen-2.5-coder-32b-instruct" : "gpt-4o");
    const activeApiKey = auth.apiKey || process.env.AGENT_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

    const llm = new ChatOpenAI({
      modelName: modelName,
      temperature: 0.1,
      openAIApiKey: activeApiKey,
      configuration: { baseURL },
    });

    const prompt = `
You are an expert Frontend Tracking Engineer.
The user is building a tracking plan for the following requirements: "${requirements}"
Target Analytics Solution / Format: ${analyticsSolution} (Ensure the JSON format adheres strictly to this solution's best practices, e.g. GA4 dataLayer.push format, Adobe XDM format, W3C standard, etc.)

Selected KPIs:
${JSON.stringify(selectedItems?.kpis || [], null, 2)}

Selected Metrics:
${JSON.stringify(selectedItems?.metrics || [], null, 2)}

Selected Dimensions:
${JSON.stringify(selectedItems?.dimensions || [], null, 2)}

Based on these items, generate a complete JSON Data Layer specification. 
The JSON should map each of the requested KPIs/Metrics/Dimensions to exact tracking events and data layer variables. 
Group them logically (e.g. by event names like 'purchase', 'login', 'custom_event').

Return ONLY a valid JSON object. Do not include markdown formatting, backticks, or any conversational text.
`;

    const res = await llm.invoke(prompt);
    let jsonContent = res.content as string;
    
    // Strip markdown if the LLM accidentally includes it
    jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();

    // Validate JSON parsing
    try {
      JSON.parse(jsonContent);
    } catch (e) {
      console.warn("LLM returned invalid JSON:", jsonContent);
      // We will still send it as a text file if it fails to parse, so the user can debug it
    }

    if (auth.isUsingDefaultKey && auth.userId) {
      await incrementAIUsage(auth.userId, 1);
    }

    return new NextResponse(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ai-generated-datalayer-${analyticsSolution.replace(/\s+/g, '-').toLowerCase()}.json"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate Data Layer file';
    console.error('[Generate Data Layer] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
