import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { authorizeAIRequest, incrementAIUsage } from '@/lib/server/aiUsage';

export const maxDuration = 60;

type GenerateSqlRequest = {
  requirements: string;
  analyticsSolution: string;
  selectedItems: any;
  insights: any[];
  apiKey?: string;
  model?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateSqlRequest = await request.json();
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
You are an expert Data Engineer.
The user is building a dashboard for the following requirements: "${requirements}"
Target Database / Analytics Solution: ${analyticsSolution}

Selected KPIs:
${JSON.stringify(selectedItems?.kpis || [], null, 2)}

Selected Metrics:
${JSON.stringify(selectedItems?.metrics || [], null, 2)}

Selected Dimensions:
${JSON.stringify(selectedItems?.dimensions || [], null, 2)}

Insights driving this dashboard:
${JSON.stringify(insights || [], null, 2)}

Based on these items, generate a complete, robust, and optimized SQL reporting script.
The script should define the necessary CTEs (Common Table Expressions) and final SELECT statements to extract these metrics from standard raw event tables (e.g. 'events', 'pageviews', 'sessions'). Use standard SQL syntax appropriate for modern data warehouses (like Snowflake or BigQuery).
Include helpful comments explaining the logic.

Return ONLY the raw SQL script. Do not include markdown formatting or backticks.
`;

    const res = await llm.invoke(prompt);
    let sqlContent = res.content as string;
    
    // Strip markdown if the LLM accidentally includes it
    sqlContent = sqlContent.replace(/^```sql\n?/, '').replace(/\n?```$/, '').trim();

    if (auth.isUsingDefaultKey && auth.userId) {
      await incrementAIUsage(auth.userId, 1);
    }

    return new NextResponse(sqlContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="ai-generated-queries.sql"',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate SQL file';
    console.error('[Generate SQL] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
