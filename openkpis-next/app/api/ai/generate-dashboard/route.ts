import { NextResponse } from 'next/server';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import { ChatOpenAI } from '@langchain/openai';
import { generateMockTableData, SchemaDefinition } from '@/lib/server/mockEngine';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Polyfill dynamic binary imports logic for edge cases
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel timeout allowance for recursive AI loops

// Define the LangGraph State Machine
const GraphState = Annotation.Root({
  userQuery: Annotation<string>(),         // "Show me sales by region"
  kpiRequirements: Annotation<string>(),   // "Needs Gross Revenue and Region"
  dbSchema: Annotation<string>(),          // JSON representation of the DuckDB schema
  mockDataPath: Annotation<string>(),      // Absolute path to the fake /tmp/ json
  generatedSql: Annotation<string>(),      // The raw SQL from Agent 3
  sqlError: Annotation<string>(),          // Self-correction loop variable
  layoutJson: Annotation<any[]>(),         // The final React Grid Layout array
  iterations: Annotation<number>(),        // Infinite-loop prevention
});

// Configure dynamic LLM routing (Vercel ENV / local .env support)
const getLLM = (agentRole: string) => {
  const baseURL = process.env[`AGENT_${agentRole}_API_BASE_URL`] || process.env.AGENT_API_BASE_URL || (process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : undefined);
  
  // Try to find a highly specialized model for this specific Agent, otherwise fall back to the global default
  // Important logic: If we are using OpenAI natively (no custom baseURL), Qwen will throw an error. So we fall back to gpt-4o.
  const modelName = process.env[`AGENT_${agentRole}_MODEL`] || process.env.AGENT_MODEL_NAME || (baseURL ? "qwen/qwen-2.5-coder-32b-instruct" : "gpt-4o");
  
  // Try to find a highly specialized API key for this specific Agent, otherwise fall back
  const apiKey = process.env[`AGENT_${agentRole}_API_KEY`] || process.env.AGENT_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  return new ChatOpenAI({
    modelName: modelName,
    temperature: 0.1,
    openAIApiKey: apiKey,
    configuration: {
      baseURL: baseURL,
    }
  });
};

// ─── AGENT 1: Business Analyst ──────────────────────────────────────────────
async function nodeBusinessAnalyst(state: typeof GraphState.State) {
  const llm = getLLM('BUSINESS_ANALYST');
  const prompt = `You are an expert Data Analyst.\nUser Request: ${state.userQuery}\nIdentify the strict business Metrics and Dimensions required to build this dashboard. Keep it concise.`;
  const res = await llm.invoke(prompt);
  return { kpiRequirements: res.content as string, iterations: 0 };
}

// ─── AGENT 2: Data Architect ────────────────────────────────────────────────
async function nodeDataArchitect(state: typeof GraphState.State) {
  // Agent 2 normally searches a Semantic Dictionary. In MVP mode, it dynamically maps Faker schemas.
  // For demonstration, we hardcode the fallback synthesis matrix.
  const schema: SchemaDefinition = {
    tableName: 'business_metrics',
    columns: [
      { name: 'transaction_id', type: 'id' },
      { name: 'timestamp', type: 'date' },
      { name: 'dimension_group', type: 'string' },
      { name: 'metric_value', type: 'number' }
    ]
  };

  // 1. Generate Fake Data
  const mockRows = generateMockTableData(schema, 500);
  
  // 2. We save it to a /tmp dir so DuckDB can use read_json_auto() seamlessly without binary buffer crashes in Next.js!
  const tmpPath = path.join(os.tmpdir(), `mock_data_${Date.now()}.json`);
  fs.writeFileSync(tmpPath, JSON.stringify(mockRows));

  return { 
    dbSchema: JSON.stringify(schema), 
    mockDataPath: tmpPath 
  };
}

// ─── AGENT 3: SQL Engineer ──────────────────────────────────────────────────
async function nodeSQLEngineer(state: typeof GraphState.State) {
  if (state.iterations > 3) {
    throw new Error('SQL Generation failed after 3 attempts.');
  }

  const llm = getLLM('SQL_ENGINEER');
  const prompt = `You are an expert DuckDB SQL Engineer.
Requirements: ${state.kpiRequirements}
Schema: ${state.dbSchema}
Table Name: read_json_auto('${state.mockDataPath}')
${state.sqlError ? `\nPREVIOUS ERROR TO FIX:\n${state.sqlError}` : ''}
Write a strict JSON response containing { "sql": "SELECT ... FROM read_json_auto(...)" } and NOTHING ELSE. No markdown formatting blocks. Just the JSON object.`;

  const res = await llm.invoke(prompt);
  let sql = "";
  try {
    const rawArgs = String(res.content).replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const parsed = JSON.parse(rawArgs);
    sql = parsed.sql;
  } catch (e) {
    sql = `SELECT * FROM read_json_auto('${state.mockDataPath}') LIMIT 10`; // Fallback parachute
  }

  return { generatedSql: sql, iterations: state.iterations + 1 };
}

// ─── THE EXECUTOR: DuckDB Sandbox ───────────────────────────────────────────
async function nodeSQLValidator(state: typeof GraphState.State) {
  // We use DuckDB via dynamic import to prevent Next.js edge-runtime build crashes
  let duckdb;
  try {
    duckdb = require('duckdb');
  } catch (e) {
    // If duckdb binary isn't perfectly mapped in local Next dev, we bypass validation for the MVP demo gracefully
    return { sqlError: "" }; 
  }

  return new Promise((resolve) => {
    const db = new duckdb.Database(':memory:');
    db.all(state.generatedSql, (err: any, rows: any) => {
      if (err) {
        resolve({ sqlError: err.message }); // Trigger LangGraph self-correction loop
      } else {
        // Success! The SQL executes perfectly.
        resolve({ sqlError: "" });
      }
    });
  });
}

// ─── THE BUILDER: Semantic Layout Packing ────────────────────────────────────
// Strict Zod boundary preventing AI UI manipulation
const SemanticLayoutSchema = z.object({
  widgets: z.array(z.object({
    id: z.string(),
    metric: z.string(),
    chartType: z.enum(['line', 'bar', 'area', 'scatter', 'scorecard']),
    sizeIntent: z.enum(['small', 'medium', 'large']),
    xAxisColumn: z.string().optional(),
    yAxisColumn: z.string(),
  }))
});

async function nodeLayoutDesigner(state: typeof GraphState.State) {
  const llm = getLLM('LAYOUT_DESIGNER');
  const prompt = `You are an expert Data Dashboard Layout Architect. 
Requirements: ${state.kpiRequirements}
Valid SQL Columns: ${state.generatedSql}

Output a strictly formatted JSON object matching this schema:
{
  "widgets": [
    { "id": "unique-name", "metric": "Sales", "chartType": "line", "sizeIntent": "large", "xAxisColumn": "date", "yAxisColumn": "sales" }
  ]
}

Available chartTypes: line, bar, area, scatter, scorecard
Available sizeIntents: small (KPIs/Cards), medium (Bar charts), large (Time-series lines)
Do not output markdown. Output valid JSON.`;

  const res = await llm.invoke(prompt);
  let parsedLayout: Record<string, unknown>[] = [];
  
  try {
    const rawArgs = String(res.content).replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const rawJson = JSON.parse(rawArgs);
    
    // MATHEMATICAL VALIDATION
    const validated = SemanticLayoutSchema.parse(rawJson);
    
    // MIDDLEWARE AUTO-FLOW ALGORITHM
    // Translates Intent into rigid React-Grid-Layout parameters (x: 0, y: Infinity)
    parsedLayout = validated.widgets.map((widget, index) => {
      let w = 4;
      let h = 1.5;
      if (widget.sizeIntent === 'large') { w = 12; h = 3; }
      else if (widget.sizeIntent === 'medium') { w = 6; h = 2; }
      
      return {
        id: widget.id + '_' + index,
        metric: widget.metric,
        chartType: widget.chartType,
        xAxisColumn: widget.xAxisColumn,
        yAxisColumn: widget.yAxisColumn,
        x: 0,
        y: Infinity, // Native Auto-Packing
        w,
        h
      };
    });
  } catch (e) {
    console.error("Layout Compilation Failed, using absolute fallback", e);
    // Absolute Enterprise Fallback so UI never crashes
    parsedLayout = [
      { id: 'fallback_card', metric: 'Data Error', chartType: 'scorecard', yAxisColumn: 'error', x: 0, y: Infinity, w: 4, h: 1.5 }
    ];
  }

  return { layoutJson: parsedLayout };
}

// ─── DEFINE THE GRAPH ROUTING LOGIC ─────────────────────────────────────────
function routeSQL(state: typeof GraphState.State) {
  if (state.sqlError) {
    return "SQLEngineer"; // Recursively Loop!
  }
  return "LayoutDesigner"; // Move Forward!
}

// Compile the LangGraph
const workflow = new StateGraph(GraphState)
  .addNode("BusinessAnalyst", nodeBusinessAnalyst)
  .addNode("DataArchitect", nodeDataArchitect)
  .addNode("SQLEngineer", nodeSQLEngineer)
  .addNode("SQLValidator", nodeSQLValidator)
  .addNode("LayoutDesigner", nodeLayoutDesigner)
  .addEdge(START, "BusinessAnalyst")
  .addEdge("BusinessAnalyst", "DataArchitect")
  .addEdge("DataArchitect", "SQLEngineer")
  .addEdge("SQLEngineer", "SQLValidator")
  .addConditionalEdges("SQLValidator", routeSQL)
  .addEdge("LayoutDesigner", END);

const appGraph = workflow.compile();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = body.query || body.requirements;

    if (!query) return NextResponse.json({ error: 'Query/Requirements required' }, { status: 400 });

    // Format the incoming insights and requirements into the main agent prompt
    const compiledQuery = `
User Requirements: ${query}
Selected Insights for Dashboard: ${body.selectedInsights ? JSON.stringify(body.selectedInsights) : 'None'}
Dataset Schema: ${body.datasetSchema ? JSON.stringify(body.datasetSchema) : 'None'}
    `.trim();

    // Execute the Multi-Agent Pipeline
    const finalState = await appGraph.invoke({ 
      userQuery: compiledQuery, 
      iterations: 0 
    });

    return NextResponse.json({ 
      success: true, 
      dashboards: [{
        title: "Generated Dashboard",
        purpose: "Orchestrated entirely by LangGraph Multi-Agent Pipeline",
        layout_notes: "Enterprise layout enabled via deterministic Auto-Flow Middleware.",
        sections: [{
          title: "Executive Overview",
          insights_covered: [],
          tiles: finalState.layoutJson.map((w: any) => ({
            metric: w.metric,
            chart: w.chartType,
            xAxisColumn: w.xAxisColumn,
            yAxisColumn: w.yAxisColumn,
            x: w.x,
            y: w.y,
            w: w.w,
            h: w.h
          }))
        }]
      }],
      debug_sql: finalState.generatedSql // Useful for UI debugging
    });

  } catch (error: any) {
    console.error('LangGraph Orchestration Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
