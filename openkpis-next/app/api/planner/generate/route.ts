import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { listEntitiesForServer } from '@/lib/server/entities';
import { sqlTableFor, withTablePrefix } from '@/src/types/entities';

export const maxDuration = 60;

type Provider = 'openai' | 'anthropic' | 'google' | 'custom';

/* ── Call each provider's raw API ── */
async function callOpenAI(prompt: string, model: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.2 }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  const d = await res.json() as { choices: { message: { content: string } }[] };
  return d.choices[0].message.content;
}

async function callAnthropic(prompt: string, model: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 8192, messages: [{ role: 'user', content: prompt }], temperature: 0.2 }),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  const d = await res.json() as { content: { type: string; text: string }[] };
  return d.content.find(b => b.type === 'text')?.text ?? '';
}

async function callGoogle(prompt: string, model: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.2 } }),
  });
  if (!res.ok) throw new Error(`Google error ${res.status}: ${await res.text()}`);
  const d = await res.json() as { candidates: { content: { parts: { text: string }[] } }[] };
  return d.candidates[0].content.parts[0].text;
}

async function callCustom(prompt: string, model: string, apiKey: string, baseUrl: string): Promise<string> {
  const url = baseUrl.replace(/\/$/, '') + '/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.2 }),
  });
  if (!res.ok) throw new Error(`Custom endpoint error ${res.status}: ${await res.text()}`);
  const d = await res.json() as { choices: { message: { content: string } }[] };
  return d.choices[0].message.content;
}

/* ── Field schemas ── */
const FIELD_SCHEMAS = {
  kpi: [
    { key: 'slug',                 label: 'Slug',                  hint: 'URL-friendly identifier, lowercase with hyphens. e.g. conversion-rate' },
    { key: 'description',         label: 'Description',           hint: 'Clear 1-2 sentence Business User friendly definition of what this KPI measures/represents and why it matters.' },
    { key: 'formula',             label: 'Formula',               hint: 'Mathematical formula or calculation. e.g. (Conversions / Sessions) × 100' },
    { key: 'category',            label: 'Category',              hint: 'One of: Conversion, Revenue, Engagement, Retention, Acquisition, Performance, Quality, Efficiency, Satisfaction.' },
    { key: 'tags',                label: 'Tags',                  hint: 'Comma-separated relevant tags.' },
    { key: 'industry',            label: 'Industry',              hint: 'One or more of: Retail, E-commerce, SaaS, Healthcare, Education, Finance, Media, Technology, Manufacturing, Other.' },
    { key: 'priority',            label: 'Priority',              hint: 'One of: High, Medium, Low.' },
    { key: 'core_area',           label: 'Core Area',             hint: 'One of: Digital Analytics, Business Intelligence, Statistics, Data Science And AI.' },
    { key: 'scope',               label: 'Scope',                 hint: 'One of: User, Session, Event, Global.' },
    { key: 'measure_type',        label: 'Measure Type',          hint: 'One of: count, rate, ratio, currency, percentage, average, index, score.' },
    { key: 'aggregation_window',  label: 'Aggregation Window',    hint: 'Which aggregations are possible. e.g. Event, Session, User, Time based - Hourly/Daily/Monthly/Yearly.' },
    { key: 'data_type',           label: 'Data Type',             hint: 'One of: string, number, boolean, datetime, array.' },
    { key: 'ga4_event',           label: 'GA4 Event Name',        hint: 'The GA4 JS event trigger action name. e.g. purchase, generate_lead, login.' },
    { key: 'adobe_event',         label: 'Adobe Event Name',      hint: 'The Adobe Analytics JS event trigger or custom link name. DO NOT use metrics like event1. e.g. scCheckout, registration_start.' },
    { key: 'w3_data_layer',       label: 'W3 Data Layer',         hint: 'W3C standard data layer object snippet for this KPI. Provide as JSON.' },
    { key: 'ga4_data_layer',      label: 'GA4 Data Layer',        hint: 'Google Analytics dataLayer.push() snippet. Provide as JSON.' },
    { key: 'adobe_client_data_layer', label: 'Adobe Client Data Layer', hint: 'Adobe ACDL adobeDataLayer.push() snippet. Provide as JSON.' },
    { key: 'xdm_mapping',         label: 'XDM Mapping',           hint: 'Adobe Experience Platform XDM schema field mapping. Provide as JSON object.' },
    { key: 'sql_query',           label: 'SQL Query',             hint: 'Example BigQuery or AEP Query Service SQL to compute/extract this entity from raw data.' },
    { key: 'calculation_notes',   label: 'Calculation Notes',     hint: 'Edge cases, exclusions, filters, or nuances in the calculation.' },
    { key: 'business_use_case',   label: 'Business Use Case',     hint: 'Concrete example of how a team would act on this KPI.' },
    { key: 'source_data',         label: 'Source Data',           hint: 'Data source(s). e.g. Digital Analytics, Business Intelligence, ERP, CRM.' },
    { key: 'dependencies',        label: 'Dependencies',          hint: 'Prerequisite Events, Metrics, Dimensions, or KPIs required. Separate by semicolon.' },
    { key: 'report_attributes',   label: 'Report Attributes',     hint: 'Attributes used in GA4/Adobe reports (Dimensions, Metrics, KPIs etc.).' },
    { key: 'dashboard_usage',     label: 'Dashboard Usage',       hint: 'Dashboards where this KPI appears. Separate by semicolon. e.g. C-Suite;Traffic Analysis.' },
    { key: 'segment_eligibility', label: 'Segment Eligibility',   hint: 'Can this KPI be used in segmentation? True or False.' },
    { key: 'data_sensitivity',    label: 'Data Sensitivity',      hint: 'One of: public, internal, confidential, restricted.' },
    { key: 'pii_flag',            label: 'Contains PII',          hint: 'Does this KPI involve Personally Identifiable Information? True or False.' },
    { key: 'related_kpis',        label: 'Related KPIs',          hint: 'Closely related KPIs. Separate by semicolon.' },
    { key: 'aliases',             label: 'Aliases',               hint: 'Alternative or common names. Separate by comma.' },
  ],
  metric: [
    { key: 'slug',                 label: 'Slug',                  hint: 'URL-friendly identifier, lowercase with hyphens.' },
    { key: 'description',         label: 'Description',           hint: 'Clear 1-2 sentence Business User friendly definition of what this entity measures/represents and why it matters.' },
    { key: 'formula',             label: 'Formula',               hint: 'How this metric is calculated.' },
    { key: 'category',            label: 'Category',              hint: 'One of: Conversion, Revenue, Engagement, Retention, Acquisition, Performance, Quality, Efficiency, Satisfaction.' },
    { key: 'tags',                label: 'Tags',                  hint: 'Comma-separated tags.' },
    { key: 'industry',            label: 'Industry',              hint: 'One or more of: Retail, E-commerce, SaaS, Healthcare, Education, Finance, Media, Technology, Manufacturing, Other.' },
    { key: 'priority',            label: 'Priority',              hint: 'One of: High, Medium, Low.' },
    { key: 'core_area',           label: 'Core Area',             hint: 'One of: Digital Analytics, Business Intelligence, Statistics, Data Science And AI.' },
    { key: 'scope',               label: 'Scope',                 hint: 'One of: User, Session, Event, Global.' },
    { key: 'measure_type',        label: 'Measure Type',          hint: 'One of: count, rate, ratio, currency, percentage, average.' },
    { key: 'aggregation_window',  label: 'Aggregation Window',    hint: 'Possible aggregation levels. e.g. Event, Session, User, Daily, Monthly.' },
    { key: 'data_type',           label: 'Data Type',             hint: 'One of: string, number, boolean, datetime, array.' },
    { key: 'ga4_event',           label: 'GA4 Event Name',        hint: 'The GA4 JS event trigger action name. e.g. purchase, generate_lead.' },
    { key: 'adobe_event',         label: 'Adobe Event Name',      hint: 'The Adobe Analytics JS event trigger or custom link name. DO NOT use metrics like event1.' },
    { key: 'w3_data_layer',       label: 'W3 Data Layer',         hint: 'W3C standard data layer snippet. Provide as JSON.' },
    { key: 'ga4_data_layer',      label: 'GA4 Data Layer',        hint: 'dataLayer.push() snippet. Provide as JSON.' },
    { key: 'adobe_client_data_layer', label: 'Adobe Client Data Layer', hint: 'adobeDataLayer.push() snippet. Provide as JSON.' },
    { key: 'xdm_mapping',         label: 'XDM Mapping',           hint: 'AEP XDM schema field mapping. Provide as JSON.' },
    { key: 'sql_query',           label: 'SQL Query',             hint: 'Example BigQuery or AEP Query Service SQL to compute/extract this entity from raw data.' },
    { key: 'calculation_notes',   label: 'Calculation Notes',     hint: 'Nuances, filters, or edge cases in the calculation.' },
    { key: 'business_use_case',   label: 'Business Use Case',     hint: 'How teams use this to make decisions.' },
    { key: 'source_data',         label: 'Source Data',           hint: 'Data source(s). e.g. Digital Analytics, CRM, ERP.' },
    { key: 'dependencies',        label: 'Dependencies',          hint: 'Prerequisite Events, Dimensions, or KPIs. Separate by semicolon.' },
    { key: 'report_attributes',   label: 'Report Attributes',     hint: 'Attributes used in platform reports.' },
    { key: 'dashboard_usage',     label: 'Dashboard Usage',       hint: 'Dashboards where this metric appears. Separate by semicolon.' },
    { key: 'segment_eligibility', label: 'Segment Eligibility',   hint: 'Can this be used in segmentation? True or False.' },
    { key: 'data_sensitivity',    label: 'Data Sensitivity',      hint: 'One of: public, internal, confidential, restricted.' },
    { key: 'pii_flag',            label: 'Contains PII',          hint: 'Involves Personally Identifiable Information? True or False.' },
    { key: 'derived_kpis',        label: 'Derived KPIs',          hint: 'KPIs built from this metric. Separate by semicolon.' },
    { key: 'related_metrics',     label: 'Related Metrics',       hint: 'Closely related metrics. Separate by semicolon.' },
    { key: 'aliases',             label: 'Aliases',               hint: 'Alternative names. Separate by comma.' },
  ],
  dimension: [
    { key: 'slug',                 label: 'Slug',                  hint: 'URL-friendly identifier, lowercase with hyphens. e.g. traffic-source.' },
    { key: 'description',         label: 'Description',           hint: 'Clear 1-2 sentence Business User friendly definition of what this entity measures/represents and why it matters.' },
    { key: 'formula',             label: 'Formula',               hint: 'Derivation formula if this is a derived/computed dimension.' },
    { key: 'category',            label: 'Category',              hint: 'One of: Conversion, Revenue, Engagement, Retention, Acquisition, Performance, Quality, Efficiency, Satisfaction.' },
    { key: 'tags',                label: 'Tags',                  hint: 'Comma-separated tags.' },
    { key: 'industry',            label: 'Industry',              hint: 'One or more of: Retail, E-commerce, SaaS, Healthcare, Education, Finance, Media, Technology, Manufacturing, Other.' },
    { key: 'priority',            label: 'Priority',              hint: 'One of: High, Medium, Low.' },
    { key: 'core_area',           label: 'Core Area',             hint: 'One of: Digital Analytics, Business Intelligence, Statistics, Data Science And AI.' },
    { key: 'scope',               label: 'Scope',                 hint: 'One of: User, Session, Event, Global.' },
    { key: 'data_type',           label: 'Data Type',             hint: 'One of: string, number, counter, boolean, datetime, array, list.' },
    { key: 'aggregation_window',  label: 'Aggregation Window',    hint: 'Which aggregations are possible. e.g. Event, Session, User, Time based - Hourly/Daily/Monthly/Yearly.' },
    { key: 'ga4_event',           label: 'GA4 Event Name',        hint: 'The GA4 JS event trigger action name that fires to capture this dimension. e.g. registration_start, login. DO NOT put parameter names here.' },
    { key: 'adobe_event',         label: 'Adobe Event Name',      hint: 'The Adobe JS event trigger or custom link name. e.g. event12, registration_start. DO NOT put eVars or props here.' },
    { key: 'w3_data_layer',       label: 'W3 Data Layer',         hint: 'W3C standard data layer object snippet. Provide as JSON.' },
    { key: 'ga4_data_layer',      label: 'GA4 Data Layer',        hint: 'GA4 dataLayer.push() snippet. Provide as JSON.' },
    { key: 'adobe_client_data_layer', label: 'Adobe Client Data Layer', hint: 'Adobe adobeDataLayer.push() snippet. Provide as JSON.' },
    { key: 'xdm_mapping',         label: 'XDM Mapping',           hint: 'AEP XDM schema field path mapping. Provide as JSON.' },
    { key: 'sql_query',           label: 'SQL Query',             hint: 'Example BigQuery or AEP Query Service SQL to compute/extract this entity from raw data.' },
    { key: 'calculation_notes',   label: 'Calculation Notes',     hint: 'Implementation notes, capture timing, gotchas.' },
    { key: 'business_use_case',   label: 'Business Use Case',     hint: 'Concrete example of how teams use this to slice/filter data.' },
    { key: 'source_data',         label: 'Source Data',           hint: 'Data source(s). e.g. Digital Analytics, Business Intelligence, ERP, CRM.' },
    { key: 'dependencies',        label: 'Dependencies',          hint: 'Prerequisite Events, Metrics, KPIs, or other Dimensions. Separate by semicolon.' },
    { key: 'report_attributes',   label: 'Report Attributes',     hint: 'Attributes in GA4/Adobe reports (Dimensions, Metrics, KPIs etc.).' },
    { key: 'dashboard_usage',     label: 'Dashboard Usage',       hint: 'Dashboards where this dimension is used. Separate by semicolon. e.g. C-Suite;Traffic Analysis.' },
    { key: 'segment_eligibility', label: 'Segment Eligibility',   hint: 'Can this dimension be used in segmentation? True or False.' },
    { key: 'data_sensitivity',    label: 'Data Sensitivity',      hint: 'One of: public, internal, confidential, restricted.' },
    { key: 'pii_flag',            label: 'Contains PII',          hint: 'Does this dimension contain Personally Identifiable Information? True or False.' },
    { key: 'related_dimensions',  label: 'Related Dimensions',    hint: 'Closely related dimensions. Separate by semicolon.' },
    { key: 'derived_dimensions',  label: 'Derived Dimensions',    hint: 'Dimensions derived from this one. Separate by semicolon.' },
    { key: 'aliases',             label: 'Aliases',               hint: 'Alternative names in other platforms or data tools. Separate by comma.' },
  ],
} as const;

type EntityType = keyof typeof FIELD_SCHEMAS;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      items: string[];
      entityType: EntityType;
      context: { industry?: string; platform?: string; extraContext?: string };
      customFields: Array<{ key: string; label: string; hint: string }>;
      provider: Provider;
      model: string;
      apiKey: string;
      baseUrl?: string;
    };

    const { items, entityType, context, customFields, provider, model, baseUrl } = body;
    let apiKey = body.apiKey;
    let isUsingDefaultKey = false;
    let aiGenerationsCount = 0;
    
    // 1. FREE TRIAL & USAGE TRACKING LOGIC
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!apiKey) {
      if (!user) {
        return NextResponse.json({ error: 'Please sign in or click ⚙ Settings to provide your own API key.' }, { status: 401 });
      }
      
      aiGenerationsCount = user.user_metadata?.ai_generations_count || 0;
      
      if (aiGenerationsCount >= 5) {
        return NextResponse.json({ error: 'You have reached your 5 free AI generations limit. Please open ⚙ Settings to add your own API key to continue.' }, { status: 403 });
      }
      
      apiKey = process.env.OPENAI_API_KEY || '';
      isUsingDefaultKey = true;
      
      if (!apiKey) {
        return NextResponse.json({ error: 'No default site key configured. Please provide your own API key in ⚙ Settings.' }, { status: 500 });
      }
    }

    if (!model) return NextResponse.json({ error: 'No model selected.' }, { status: 400 });

    // 2. TRUE RAG RETRIEVAL (Query-Driven Fuzzy Match with Semantic Synonym Expansion)
    let existingCatalog: Array<{ name: string; slug: string; data_layer?: unknown }> = [];
    try {
      const adminClient = createAdminClient();
      const tableName = sqlTableFor(entityType);
      const matchesMap = new Map();
      
      // Step A: Semantic Synonym Expansion (LLM)
      // This simulates true semantic search without the massive cost of pgvector/embeddings
      let expandedTerms: Record<string, string[]> = {};
      try {
        const actualProvider = isUsingDefaultKey ? 'openai' : provider;
        const actualModel = isUsingDefaultKey ? 'gpt-4o' : model;
        
        const synonymPrompt = `You are a digital analytics dictionary. For each of the following requested items, provide exactly 2 common synonyms or alternative names used in tracking plans.
Return ONLY valid JSON in this format: {"Item Name": ["synonym1", "synonym2"]}. Do not include markdown or explanations.
Items: ${items.join(', ')}`;

        let rawSynonyms: string;
        if (actualProvider === 'anthropic') rawSynonyms = await callAnthropic(synonymPrompt, 'claude-haiku-4-5', apiKey);
        else if (actualProvider === 'google') rawSynonyms = await callGoogle(synonymPrompt, 'gemini-3-flash', apiKey);
        else if (actualProvider === 'custom') rawSynonyms = await callCustom(synonymPrompt, actualModel, apiKey, baseUrl ?? 'http://localhost:11434/v1');
        else rawSynonyms = await callOpenAI(synonymPrompt, 'gpt-5.4-mini', apiKey);
        
        const strippedSynonyms = rawSynonyms.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
        expandedTerms = JSON.parse(strippedSynonyms);
      } catch (e) {
        console.warn("Failed to generate synonyms for semantic match:", e);
      }
      
      // Step B: Multi-Field Fuzzy Search including Semantic Synonyms
      for (const itemName of items) {
        const searchTerm = itemName.trim();
        const simpleTerm = searchTerm.split(' ')[0]; // Fallback broad match
        
        // Build the OR clause with the original term
        let orQuery = `name.ilike.%${searchTerm}%,slug.ilike.%${searchTerm.replace(/\s+/g, '-')}%,name.ilike.%${simpleTerm}%`;
        
        // Inject Semantic Synonyms if available
        const synonyms = expandedTerms[itemName] || [];
        for (const syn of synonyms) {
           const cleanSyn = syn.trim();
           if (cleanSyn) {
               orQuery += `,name.ilike.%${cleanSyn}%,slug.ilike.%${cleanSyn.replace(/\s+/g, '-')}%,aliases.cs.{${cleanSyn}}`;
           }
        }
        
        // We perform a fuzzy match against name, slug, or an exact match in aliases using the dynamic OR query
        const { data, error } = await adminClient
          .from(tableName)
          .select('name, slug, ga4_data_layer, adobe_client_data_layer, xdm_mapping')
          .or(orQuery)
          .eq('status', 'published')
          .limit(3);
          
        if (data && !error) {
          data.forEach((e: any) => {
            if (!matchesMap.has(e.slug)) {
              let dl = undefined;
              if (context.platform?.includes('GA4')) dl = e.ga4_data_layer;
              else if (context.platform?.includes('Adobe Analytics')) dl = e.adobe_client_data_layer;
              else if (context.platform?.includes('XDM')) dl = e.xdm_mapping;
              
              matchesMap.set(e.slug, { name: e.name, slug: e.slug, data_layer: dl });
            }
          });
        }
      }
      existingCatalog = Array.from(matchesMap.values());
    } catch (e) {
      console.warn("Failed to fetch targeted catalog for RAG context:", e);
    }

    // Step C: Master UDL Fetch for RAG Context
    let masterUdlSchema: any = null;
    try {
      const adminClient = createAdminClient();
      const { data: udls } = await adminClient
        .from(withTablePrefix('unified_data_layers'))
        .select('master_schema')
        .eq('industry', context.industry || 'Global')
        .eq('platform', context.platform || 'GA4')
        .limit(1);
      
      if (udls && udls.length > 0) {
        masterUdlSchema = udls[0].master_schema;
      }
    } catch (e) {
      console.warn("Failed to fetch Master UDL for RAG context", e);
    }

    const schema = [...FIELD_SCHEMAS[entityType], ...customFields];
    const fieldList = schema.map(f => `- "${f.key}": ${f.hint}`).join('\n');
    const itemList  = items.map((n, i) => `${i + 1}. ${n}`).join('\n');
    const ctx = [
      context.industry     && `Industry: ${context.industry}`,
      context.platform     && `Analytics platform: ${context.platform}`,
      context.extraContext,
    ].filter(Boolean).join('\n');

    const prompt = `You are an expert analytics consultant building a Tracking Plan.

Task: Generate complete, production-ready ${entityType.toUpperCase()} definitions for every requested item.
${ctx ? `\nContext:\n${ctx}\n` : ''}

REQUESTED ITEMS:
${itemList}

Fields to fill:
${fieldList}

CRITICAL INSTRUCTION FOR EVENT FIELDS:
When filling "ga4_event" or "adobe_event", you MUST provide the actual JavaScript Event Trigger/Action name (e.g., 'registration_complete', 'login', 'purchase'). NEVER put variable names, eVars, props, or parameters in these fields. Parameter mappings and eVars belong exclusively in the data layer or XDM mapping fields!

IMPORTANT INSTRUCTIONS FOR EXISTING ITEMS (RAG CONSOLIDATION):
Here is a list of existing ${entityType}s in the OpenKPIs Standard Catalog:
${JSON.stringify(existingCatalog.slice(0, 50).map(c => ({ name: c.name, slug: c.slug })), null, 2)}

If a requested item perfectly matches an existing item in the catalog above, DO NOT generate all fields for it. Instead, just return the "slug" field for that item, and set "name" to the name. Leave all other fields blank to save tokens.
If the item is net-new, generate ALL fields thoroughly.

${context.platform ? `\nFor platform ${context.platform}, here are some sample existing DataLayer/XDM snippets from the catalog to maintain consistency:\n${JSON.stringify(existingCatalog.filter(c => c.data_layer).slice(0, 3).map(c => c.data_layer), null, 2)}\n` : ''}

${masterUdlSchema ? `\nCRITICAL UDL RAG CONTEXT:
The following is the authoritative Master Unified Data Layer (UDL) for this platform and industry. 
When generating data layer fields (e.g. w3_data_layer, ga4_data_layer, xdm_mapping), you MUST aggressively reuse the exact field names, nested structures, and properties defined in this Master UDL. Do NOT invent new fields if a perfectly suitable field already exists in this schema:
${JSON.stringify(masterUdlSchema, null, 2)}\n` : ''}

Return ONLY valid JSON — no markdown, no explanation:
{"items": [{"name": "exact item name", ...fields or just slug...}, ...]}`;

    // Ensure prompt string works well with the system
    let raw: string;
    // We override provider if default key is used to guarantee it works with our OPENAI_API_KEY
    const actualProvider = isUsingDefaultKey ? 'openai' : provider;
    const actualModel = isUsingDefaultKey ? 'gpt-4o' : model;

    if (actualProvider === 'anthropic') raw = await callAnthropic(prompt, actualModel, apiKey);
    else if (actualProvider === 'google') raw = await callGoogle(prompt, actualModel, apiKey);
    else if (actualProvider === 'custom') raw = await callCustom(prompt, actualModel, apiKey, baseUrl ?? 'http://localhost:11434/v1');
    else raw = await callOpenAI(prompt, actualModel, apiKey);

    const stripped = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let parsed: unknown;
    try { parsed = JSON.parse(stripped); }
    catch { return NextResponse.json({ error: 'AI returned invalid JSON — try again.' }, { status: 500 }); }

    let results: Record<string, unknown>[] = [];
    if (Array.isArray(parsed)) results = parsed;
    else if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>;
      if (Array.isArray(obj.items)) results = obj.items;
      else {
        const k = Object.keys(obj).find(k => Array.isArray(obj[k]));
        results = k ? obj[k] as Record<string, unknown>[] : [obj];
      }
    }

    if (!results.length) return NextResponse.json({ error: 'AI returned no results. Try rephrasing the names.' }, { status: 500 });

    // 3. REHYDRATE SLUGS FROM DATABASE
    // If the AI returned only `{ name, slug }`, we pull the full entity from the DB.
    try {
      const allEntities = await listEntitiesForServer({ kind: entityType, limit: 1000 });
      results = results.map(res => {
        // AI returns just slug if it matches
        if (res.slug && Object.keys(res).length <= 3) { // usually name, slug, maybe one other
          const matchedDbEntity = allEntities.find(e => e.slug === res.slug);
          if (matchedDbEntity) {
            return { ...matchedDbEntity, name: matchedDbEntity.name }; // hydrate full object
          }
        }
        return res;
      });
    } catch (err) {
      console.warn("Failed to rehydrate slugs", err);
    }

    // 4. INCREMENT FREE TRIAL USAGE & AUTO-PROPOSE DRAFTS
    if (user) {
      const admin = createAdminClient();
      
      // Free Trial Usage Increment
      if (isUsingDefaultKey) {
        await admin.auth.admin.updateUserById(user.id, {
          user_metadata: { ai_generations_count: aiGenerationsCount + 1 }
        });
      }

      // Auto-Propose: Save newly generated items as 'draft'
      const newItems = results.filter(res => Object.keys(res).length > 3 && res.slug);
      if (newItems.length > 0) {
        try {
          const table = sqlTableFor(entityType as Parameters<typeof sqlTableFor>[0]);
          const itemsToInsert = newItems.map(item => ({
            ...item,
            status: 'draft',
            created_by: user.id,
            last_modified_by: user.id,
          }));
          await admin.from(table).upsert(itemsToInsert, { onConflict: 'slug', ignoreDuplicates: true });
        } catch (err: unknown) {
          console.warn("Failed to auto-propose drafts to governance queue:", err);
        }
      }
    }

    return NextResponse.json({ results, schema });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
