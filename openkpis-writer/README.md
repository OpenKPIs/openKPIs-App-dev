# OpenKPIs Writer

AI-powered documentation tool for KPIs, Metrics & Dimensions. Paste a list of names, and the AI fills every field — description, formula, GA4/Adobe events, SQL queries, business use cases, and more.

## Features
- 📋 **Batch generation** — paste 1 to 50+ names at once
- 🤖 **AI Writer** — fills all fields from the OpenKPIs schema automatically
- ✏️ **Inline editing** — review and correct every field before export
- ➕ **Custom fields** — add your own fields beyond the standard schema
- ⬇️ **Export** — download as JSON (for OpenKPIs import) or CSV
- 🔒 **Private** — API key is browser-only, never stored on any server

## Quick Start (Local)

```bash
cd openkpis-writer
cp .env.local.example .env.local
# Edit .env.local and add your OpenAI API key
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (or whatever port Next.js picks).

> **Tip:** You can also paste your API key in the ⚙ Settings modal — it stays in browser memory only, nothing is stored server-side.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Connect to Vercel: [vercel.com/new](https://vercel.com/new)
3. Set environment variable: `OPENAI_API_KEY = sk-...`
4. Deploy

## Entity Types & Fields Generated

| Entity | Key Fields |
|--------|-----------|
| **KPI** | description, formula, category, industry, measure_type, ga4_event, adobe_event, sql_query, business_use_case, calculation_notes, data_sensitivity, aliases + more |
| **Metric** | description, formula, category, aggregation_window, ga4_event, adobe_event, sql_query, derived_kpis + more |
| **Dimension** | description, category, data_type, scope, ga4 parameter, adobe eVar/prop, sql example, business_use_case + more |
