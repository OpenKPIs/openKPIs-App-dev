/**
 * AI Service - Loads OpenAI API key from next.config.js
 * This bypasses any cached .env.local loading issues
 */

export interface AISuggestion {
  name: string;
  description: string;
  category?: string;
  tags?: string[];
}

export interface AIResponse {
  kpis?: AISuggestion[];
  metrics?: AISuggestion[];
  dimensions?: AISuggestion[];
}

export interface DashboardSuggestion {
  name: string;
  description: string;
  kpis: string[];
  layout: 'grid' | 'list' | 'dashboard';
  visualization: string[];
}

export interface InsightSuggestion {
  title: string;
  description: string;
  relatedKPIs: string[];
  actionItems: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Get OpenAI API key with validation and debugging
 * This ensures we're using the key from next.config.js (loaded from .Credentials.txt)
 */
function getOpenAIKey(): string {
  // Get key from process.env (set by next.config.js or Vercel environment variables)
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    const isVercel = process.env.VERCEL ? 'Vercel Dashboard' : '.Credentials.txt or next.config.js';
    throw new Error(`OPENAI_API_KEY is not configured. Please set it in ${isVercel}`);
  }

  // Clean the key - remove any whitespace, newlines, quotes
  const cleanKey = apiKey.trim().replace(/\r?\n/g, '').replace(/\s+/g, '').replace(/^["']|["']$/g, '').trim();

  // Validate format - must start with sk-proj-
  if (!cleanKey.startsWith('sk-proj-')) {
    // Log key info for debugging (without exposing full key)
    const keyPreview = cleanKey.substring(0, 30) + '...' + cleanKey.substring(cleanKey.length - 10);
    console.error('[AI Service] Invalid OpenAI API key format:', {
      prefix: cleanKey.substring(0, 15),
      suffix: '...' + cleanKey.substring(cleanKey.length - 10),
      length: cleanKey.length,
      startsWithSkProj: cleanKey.startsWith('sk-proj-'),
    });
    throw new Error(`Invalid OpenAI API key format. Must start with "sk-proj-". Got: ${keyPreview}`);
  }

  // Validate it's the correct key (not the old cached one ending in a5UA)
  if (cleanKey.endsWith('sa5UA') || cleanKey.includes('yKSYHv5k4AkQzVylinLZ8yvC_PQlDFmL0')) {
    console.error('[AI Service] ⚠️  DETECTED OLD/CACHED API KEY!');
    console.error('[AI Service] This indicates a caching issue. Key ends with:', cleanKey.substring(cleanKey.length - 10));
    throw new Error('Detected old/cached OpenAI API key. Please restart the Next.js dev server to clear cache.');
  }

  // Verify it's the correct key (should end with KJIA)
  if (!cleanKey.includes('spXzvD9m19lkfWkzFS6q8CvtCNPg7LSAZ')) {
    console.warn('[AI Service] ⚠️  API key may not be from .Credentials.txt. Expected pattern not found.');
  }

  // Log success (in development only, with partial key)
  if (process.env.NODE_ENV === 'development') {
    console.log('[AI Service] ✅ OpenAI API key loaded successfully:', {
      prefix: cleanKey.substring(0, 15),
      suffix: '...' + cleanKey.substring(cleanKey.length - 10),
      length: cleanKey.length,
      source: 'next.config.js → .Credentials.txt',
    });
  }

  return cleanKey;
}

/**
 * Make OpenAI API call with consistent error handling and timeout
 */
async function callOpenAI(prompt: string, systemPrompt: string = 'Return ONLY valid JSON, no markdown, no explanations.'): Promise<string> {
  const apiKey = getOpenAIKey();
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

  // Priority Processing (only for Enterprise customers)
  // Enable via OPENAI_SERVICE_TIER=priority in .Credentials.txt
  const serviceTier = process.env.OPENAI_SERVICE_TIER;
  if (serviceTier === 'priority') {
    requestBody.service_tier = 'priority';
    if (process.env.NODE_ENV === 'development') {
      console.log('[AI Service] Using Priority Processing (Enterprise feature)');
    }
  }

  // Some models (like gpt-5) only support default temperature (1)
  // Check if model requires default temperature only
  const requiresDefaultTemperature = model.includes('gpt-5') || 
                                    model.includes('o1') || 
                                    model.includes('o3');
  
  // Token limits explanation:
  // - OpenAI context window: ~1 million tokens (input + output combined)
  // - Input tokens: ~500-2000 tokens (prompt + requirements)
  // - Output tokens: Increased to 20K to support many KPIs/metrics/dimensions
  // - This leaves plenty of room (still well under 1MM total)
  
  // High output token limits to handle user-specified number of KPIs
  // For slower models, use slightly lower limits, but still generous
  const isSlowModel = model.includes('gpt-5') || model.includes('o1') || model.includes('o3');
  const baseMaxTokens = isSlowModel ? 15000 : 20000; // High limit for many KPIs (20K tokens = ~15,000 words)
  const maxTokens = baseMaxTokens;
  
  // Use appropriate parameter based on model
  if (isNewModel) {
    requestBody.max_completion_tokens = maxTokens;
  } else {
    requestBody.max_tokens = maxTokens;
  }

  // Only set temperature if model supports it
  if (!requiresDefaultTemperature) {
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
      const errorMessage = error.error?.message || 'Unknown error';
      
      // Enhanced error logging
      console.error('[AI Service] OpenAI API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        keyUsed: apiKey.substring(0, 15) + '...' + apiKey.substring(apiKey.length - 10),
      });
      
      throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
    }

    const data = await response.json();
    
    // Enhanced debugging for response issues
    if (!data.choices || data.choices.length === 0) {
      console.error('[AI Service] No choices in response:', {
        model,
        responseKeys: Object.keys(data),
        fullResponse: JSON.stringify(data, null, 2).substring(0, 500),
      });
      throw new Error('OpenAI returned response without choices. The API may be experiencing issues.');
    }

    const choice = data.choices[0];
    const content = choice?.message?.content;

    if (!content) {
      const finishReason = choice?.finish_reason;
      const logInfo = {
        model,
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        finishReason: finishReason,
        hasMessage: !!choice?.message,
        messageKeys: choice?.message ? Object.keys(choice.message) : [],
        usage: data.usage,
        maxTokensRequested: maxTokens,
      };
      
      console.error('[AI Service] No content in response:', logInfo);
      
      // Provide specific error messages based on finish_reason
      if (finishReason === 'length') {
        // Show both requested and actual tokens used
        const tokensUsed = data.usage?.completion_tokens || 'unknown';
        const tokenInfo = data.usage?.completion_tokens ? 
          `Requested: ${maxTokens} tokens, Actually used: ${tokensUsed} tokens` :
          `Requested: ${maxTokens} tokens`;
        throw new Error(`OpenAI response was cut off due to output token limit (${tokenInfo}). The response was too long. Try reducing the requirements or requesting fewer items.`);
      } else if (finishReason === 'content_filter') {
        throw new Error('OpenAI filtered the response. Please adjust your requirements.');
      } else if (finishReason === 'stop' && !content) {
        throw new Error('OpenAI returned an empty response. The model may have encountered an issue. Please try again with shorter requirements.');
      } else {
        throw new Error(`No response content from OpenAI. Finish reason: ${finishReason || 'unknown'}. Please try again.`);
      }
    }

    // Validate content is not just whitespace
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      throw new Error('OpenAI returned empty content. Please try again with different requirements.');
    }

    return trimmedContent;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle timeout specifically
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      console.error('[AI Service] Request timeout after', timeoutMs, 'ms');
      throw new Error(`Request timed out after ${timeoutMs / 1000} seconds. The AI model may be taking longer than expected. Please try again with shorter requirements or try a different model.`);
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Get AI suggestions based on requirements
 * @param requirements - Business requirements text
 * @param analyticsSolution - Analytics platform (GA4, Adobe, etc.)
 * @param kpiCount - Number of KPIs to generate (default: 5)
 */
export async function getAISuggestions(
  requirements: string,
  analyticsSolution: string,
  kpiCount: number = 5
): Promise<AIResponse> {
  // Truncate requirements if too long (but allow more for detailed requests)
  const truncatedRequirements = requirements.length > 1000 
    ? requirements.substring(0, 1000) + '...' 
    : requirements;

  // Calculate metrics and dimensions based on KPI count (proportional)
  const metricsCount = Math.max(2, Math.floor(kpiCount * 0.6)); // 60% of KPIs
  const dimensionsCount = Math.max(2, Math.floor(kpiCount * 0.6)); // 60% of KPIs

  const prompt = `Analytics: ${analyticsSolution}. Requirements: ${truncatedRequirements}

Suggest exactly ${kpiCount} KPIs, ${metricsCount} Metrics, ${dimensionsCount} Dimensions. Keep descriptions concise (max 15 words each). Return JSON only (no markdown, no explanations):
{"kpis":[{"name":"KPI name","description":"brief description","category":"category","tags":["tag1"]}],"metrics":[{"name":"Metric name","description":"brief description","category":"category","tags":[]}],"dimensions":[{"name":"Dimension name","description":"brief description","category":"category","tags":[]}]}`;

  const content = await callOpenAI(prompt);
  
  try {
    // Try to extract JSON if it's wrapped in markdown code blocks
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      const match = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonContent = match[1].trim();
      }
    }
    
    const parsed = JSON.parse(jsonContent) as AIResponse;
    
    // Ensure we have all arrays, even if empty
    if (!parsed.kpis) {
      parsed.kpis = [];
    }
    if (!parsed.metrics) {
      parsed.metrics = [];
    }
    if (!parsed.dimensions) {
      parsed.dimensions = [];
    }
    
    return parsed;
  } catch (e: any) {
    console.error('[AI Service] JSON parse error:', {
      error: e.message,
      contentPreview: content.substring(0, 200),
      contentLength: content.length,
    });
    throw new Error(`Invalid JSON response from OpenAI: ${e.message}. The AI may have returned non-JSON content.`);
  }
}

/**
 * Get additional KPI/item suggestions (Step 3)
 */
export async function getAdditionalSuggestions(
  requirements: string,
  analyticsSolution: string,
  existingSuggestions: AISuggestion[]
): Promise<AIResponse> {
  // Truncate long inputs very aggressively
  const truncatedRequirements = requirements.length > 600 
    ? requirements.substring(0, 600) + '...' 
    : requirements;
  const existingNames = existingSuggestions.slice(0, 10).map(s => s.name).join(', '); // Limit to first 10
  
  const prompt = `Analytics consultant for ${analyticsSolution}.

Requirements: ${truncatedRequirements}
Already suggested: ${existingNames}

Suggest 2 ADDITIONAL KPIs, 2 Metrics, 2 Dimensions. Descriptions: max 12 words each. Return JSON only:
{"kpis":[{"name":"...","description":"...","category":"...","tags":[]}],"metrics":[{"name":"...","description":"...","category":"...","tags":[]}],"dimensions":[{"name":"...","description":"...","category":"...","tags":[]}]}`;

  const content = await callOpenAI(prompt);
  
  try {
    // Extract JSON from markdown code blocks if present
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      const match = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonContent = match[1].trim();
      }
    }
    return JSON.parse(jsonContent) as AIResponse;
  } catch (e: any) {
    throw new Error(`Invalid JSON response from OpenAI: ${e.message}`);
  }
}

/**
 * Get dashboard suggestions (Step 4)
 */
export interface DashboardSection {
  title: string;
  insights_covered: string[];
  tiles: Array<{
    metric: string;
    by: string[];
    chart: string;
  }>;
}

export interface DashboardSuggestionDetailed {
  title: string;
  purpose: string;
  sections: DashboardSection[];
  layout_notes: string;
  markdown?: string; // Generated markdown output
}

export async function getDashboardSuggestions(
  requirements: string,
  analyticsSolution: string,
  selectedInsights: any[],
  aiExpanded: any | null
): Promise<DashboardSuggestionDetailed[]> {
  const truncatedRequirements = requirements.length > 400 
    ? requirements.substring(0, 400) + '...' 
    : requirements;
  
  // Build insight context
  const insightsContext = selectedInsights.map((insight: any) => 
    `- [${insight.id}] ${insight.title} (${insight.group}): ${insight.rationale}. Chart: ${insight.chart_hint}`
  ).join('\n');
  
  let contextText = `Requirements: ${truncatedRequirements}\n\nSelected Insights:\n${insightsContext}`;
  if (aiExpanded) {
    contextText += `\n\nGoal: ${aiExpanded.goal || ''}\nScope: ${(aiExpanded.scope || []).join(', ')}`;
  }
  
  const prompt = `Analytics consultant for ${analyticsSolution}.

${contextText}

Design 1-2 comprehensive dashboards based on the selected insights above. Each dashboard should organize insights into logical sections.

Return ONLY valid JSON (no markdown):
{
  "dashboards": [
    {
      "title": "Dashboard name",
      "purpose": "Clear purpose statement",
      "sections": [
        {
          "title": "Section name (e.g., Acquisition Quality)",
          "insights_covered": ["insight_id_1", "insight_id_2"],
          "tiles": [
            {"metric": "Metric name", "by": ["dimension1", "dimension2"], "chart": "chart_type"}
          ]
        }
      ],
      "layout_notes": "Layout guidance (e.g., '2-column grid; keep cohort wide')"
    }
  ]
}`;

  const content = await callOpenAI(prompt);
  
  try {
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      const match = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonContent = match[1].trim();
      }
    }
    const parsed = JSON.parse(jsonContent);
    const dashboards: DashboardSuggestionDetailed[] = parsed.dashboards || [];
    
    // Generate markdown for each dashboard
    return dashboards.map(dashboard => ({
      ...dashboard,
      markdown: generateDashboardMarkdown(dashboard, selectedInsights)
    }));
  } catch (e: any) {
    throw new Error(`Invalid JSON response from OpenAI: ${e.message}`);
  }
}

/**
 * Generate markdown output for a dashboard
 */
function generateDashboardMarkdown(dashboard: DashboardSuggestionDetailed, insights: any[]): string {
  const insightMap = new Map(insights.map((insight: any) => [insight.id, insight]));
  
  let markdown = `# ${dashboard.title}\n\n`;
  markdown += `**Purpose:** ${dashboard.purpose}\n\n`;
  markdown += `---\n\n`;
  
  dashboard.sections.forEach((section, idx) => {
    markdown += `## ${section.title}\n\n`;
    
    // List insights covered in this section
    if (section.insights_covered.length > 0) {
      markdown += `**Insights Covered:**\n`;
      section.insights_covered.forEach((insightId: string) => {
        const insight = insightMap.get(insightId);
        if (insight) {
          markdown += `- **${insight.title}** (${insight.group}): ${insight.rationale}\n`;
        }
      });
      markdown += `\n`;
    }
    
    // List tiles/metrics
    if (section.tiles.length > 0) {
      markdown += `**Metrics & Visualizations:**\n\n`;
      section.tiles.forEach((tile, tileIdx) => {
        markdown += `### ${tile.metric}\n\n`;
        markdown += `- **Breakdown by:** ${tile.by.join(', ')}\n`;
        markdown += `- **Chart Type:** ${tile.chart}\n\n`;
      });
    }
    
    if (idx < dashboard.sections.length - 1) {
      markdown += `---\n\n`;
    }
  });
  
  if (dashboard.layout_notes) {
    markdown += `## Layout Notes\n\n${dashboard.layout_notes}\n`;
  }
  
  return markdown;
}

/**
 * Get insights and recommendations (Step 3)
 * Now generates grouped insights with new structure
 */
export interface GroupedInsight {
  id: string;
  group: string; // Acquisition, Engagement, Conversion, Monetization, Retention
  title: string;
  rationale: string;
  data_requirements: string[];
  chart_hint: string;
  signal_strength: 'low' | 'medium' | 'high';
}

export async function getInsightSuggestions(
  requirements: string,
  analyticsSolution: string,
  aiExpanded: any | null,
  selectedKPIs?: Array<{ name: string; description?: string; category?: string; tags?: string[] }>,
  selectedMetrics?: Array<{ name: string; description?: string; category?: string; tags?: string[] }>,
  selectedDimensions?: Array<{ name: string; description?: string; category?: string; tags?: string[] }>
): Promise<GroupedInsight[]> {
  const truncatedRequirements = requirements.length > 400 
    ? requirements.substring(0, 400) + '...' 
    : requirements;
  
  let contextText = `Requirements: ${truncatedRequirements}`;
  if (aiExpanded) {
    contextText += `\n\nGoal: ${aiExpanded.goal || ''}
Scope: ${(aiExpanded.scope || []).join(', ')}
Time Horizon: ${aiExpanded.time_horizon || ''}
Breakdowns: ${(aiExpanded.breakdowns || []).join(', ')}
Key Questions: ${(aiExpanded.questions || []).join('; ')}`;
  }
  
  // Format selected items for the prompt
  let selectedItemsText = '';
  const allItems: Array<{ type: string; item: any }> = [
    ...(selectedKPIs || []).map(item => ({ type: 'KPI', item })),
    ...(selectedMetrics || []).map(item => ({ type: 'Metric', item })),
    ...(selectedDimensions || []).map(item => ({ type: 'Dimension', item })),
  ];
  
  if (allItems.length > 0) {
    selectedItemsText = '\n\nSelected Items:\n';
    allItems.forEach(({ type, item }) => {
      selectedItemsText += `- ${type}: ${item.name}`;
      if (item.description) {
        selectedItemsText += ` - ${item.description}`;
      }
      if (item.category) {
        selectedItemsText += ` (Category: ${item.category})`;
      }
      if (item.tags && item.tags.length > 0) {
        selectedItemsText += ` [Tags: ${item.tags.join(', ')}]`;
      }
      selectedItemsText += '\n';
    });
  } else {
    selectedItemsText = '\n\nSelected Items: None specified yet.';
  }
  
  const prompt = `Analytics consultant for ${analyticsSolution}.

${contextText}${selectedItemsText}

Context:
The user has selected the following items for analysis.
Each item includes its definition, category, and associated tags.

Task:
Generate 8-12 analytical insights grouped by category (Acquisition, Engagement, Conversion, Monetization, Retention).

CRITICAL INSTRUCTIONS:
1. Provide insights that can logically be *inferred* from how these KPIs interact or trend — NOT hypothetical or fabricated data.
2. Write insights as *qualitative observations* or *potential analytical directions* a user could explore when these KPIs are visualized in a dashboard.
3. Keep tone: concise, professional, analytical — as if preparing dashboard commentary.

DO NOT include:
- Specific percentages, numbers, or metrics (e.g., "29% retention", "2.6x churn rate")
- Fake data points or fabricated statistics
- Hypothetical scenarios with made-up numbers

DO include:
- Qualitative observations about KPI relationships
- Potential analytical directions to explore
- Logical inferences about how KPIs might interact
- Recommendations for what to investigate when visualizing these KPIs

Return ONLY valid JSON (no markdown):
{
  "insights": [
    {
      "id": "insight_retention_campaign",
      "group": "Retention",
      "title": "Campaign-driven cohorts may show retention patterns worth investigating",
      "rationale": "Analyzing cohort retention curves by acquisition campaign could reveal which channels drive more engaged users over time. Compare retention rates across different campaign sources to identify quality acquisition channels.",
      "data_requirements": ["events: signup, session_start", "dimension: campaign", "metric: retention_curve"],
      "chart_hint": "cohort_curve",
      "signal_strength": "medium"
    }
  ]
}

Groups should be: Acquisition, Engagement, Conversion, Monetization, Retention.
Signal strength: low, medium, or high (based on how directly the insight relates to the stated requirements).
Chart hints: bar, line, cohort_curve, funnel, heatmap, scatter, table, etc.`;

  const content = await callOpenAI(prompt);
  
  try {
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```')) {
      const match = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonContent = match[1].trim();
      }
    }
    const parsed = JSON.parse(jsonContent);
    return parsed.insights || [];
  } catch (e: any) {
    throw new Error(`Invalid JSON response from OpenAI: ${e.message}`);
  }
}
