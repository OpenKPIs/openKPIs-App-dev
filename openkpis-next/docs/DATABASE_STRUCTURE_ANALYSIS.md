# Supabase Database Structure Analysis

## Current Database Architecture

### ✅ **SEPARATE TABLES** (One table per entity type)

The application uses **5 separate Supabase tables**, one for each entity type:

| Entity Type | Table Name (Dev) | Table Name (Prod) | Purpose |
|------------|------------------|-------------------|---------|
| **KPI** | `dev_kpis` | `prod_kpis` | Stores KPI entities |
| **Metric** | `dev_metrics` | `prod_metrics` | Stores Metric entities |
| **Dimension** | `dev_dimensions` | `prod_dimensions` | Stores Dimension entities |
| **Event** | `dev_events` | `prod_events` | Stores Event entities |
| **Dashboard** | `dev_dashboards` | `prod_dashboards` | Stores Dashboard entities |

### Table Prefix Logic

```typescript
// src/types/entities.ts
export function resolveTablePrefix(): string {
  const env = (process.env.NEXT_PUBLIC_APP_ENV || '').toLowerCase();
  if (env.startsWith('prod')) return 'prod_';
  if (env.startsWith('dev')) return 'dev_';
  return '';
}

export function tableFor(kind: EntityKind): string {
  switch (kind) {
    case 'kpi': return 'kpis';
    case 'metric': return 'metrics';
    case 'dimension': return 'dimensions';
    case 'event': return 'events';
    case 'dashboard': return 'dashboards';
  }
}

export function withTablePrefix(table: string): string {
  return `${resolveTablePrefix()}${table}`;
}
```

### How Tables Are Accessed

```typescript
// Example: lib/server/kpis.ts
const kpisTable = withTablePrefix('kpis');
// Results in: 'dev_kpis' or 'prod_kpis' depending on environment

// Example: lib/services/entityUpdates.ts
const tableName = tableFor(kind); // 'kpis', 'metrics', etc.
const table = withTablePrefix(tableName); // 'dev_kpis', 'prod_kpis', etc.
```

---

## Why Separate Tables?

### ✅ **Advantages of Separate Tables**

1. **Schema Flexibility**
   - Each entity type has different fields
   - KPIs have `measure_type`, Dimensions have `data_type`, Events have `event_type`
   - Can optimize indexes per entity type
   - Can add entity-specific constraints

2. **Performance**
   - Smaller tables = faster queries
   - Entity-specific indexes
   - No need to filter by `entity_type` column
   - Better query optimization

3. **Data Integrity**
   - Entity-specific constraints and validations
   - Type safety at database level
   - Foreign key relationships (if needed)

4. **Scalability**
   - Can scale tables independently
   - Can archive old entities per type
   - Better for large datasets

### ❌ **Disadvantages of Separate Tables**

1. **Code Duplication**
   - Similar CRUD operations for each table
   - Similar validation logic
   - Similar query patterns

2. **Cross-Entity Queries**
   - More complex joins if needed
   - Harder to query "all entities" together

---

## Impact on Form Consolidation

### ✅ **NO DATABASE CHANGES NEEDED**

The form consolidation is **UI-layer only** and does NOT require database changes:

1. **Database Structure Stays the Same**
   - Separate tables remain separate
   - No schema changes needed
   - No data migration required

2. **API Layer Stays the Same**
   - Current API routes: `/api/items/{entity}/{id}`
   - Can keep separate OR consolidate (recommend keeping separate for now)
   - `updateEntityDraftAndSync()` already handles all entity types

3. **GitHub Sync Stays the Same**
   - Uses `tableName` parameter: `'kpis' | 'metrics' | 'dimensions' | 'events' | 'dashboards'`
   - `generateYAML()` already handles all entity types
   - No changes needed

### Form Consolidation Only Affects:

1. **UI Components** (Client-side)
   - `EntityEditForm` component (new)
   - Field configuration system (new)
   - Remove duplicate `*EditClient.tsx` files

2. **Type Definitions** (TypeScript)
   - Entity-specific types stay the same
   - Add form configuration types (new)

3. **No Database Changes**
   - ✅ Tables remain separate
   - ✅ Schemas unchanged
   - ✅ Data migration not needed

---

## Database Schema Comparison

### Common Fields (All Entities)
```sql
id: uuid (primary key)
slug: text (unique)
name: text
description: text
category: text
tags: text[]
status: 'draft' | 'published' | 'archived'
created_by: text
created_at: timestamp
last_modified_by: text
last_modified_at: timestamp
-- ... governance, GitHub, contribution fields
```

### Entity-Specific Fields

**KPIs** (`prod_kpis`):
- `formula: text`
- `measure_type: text`
- `related_kpis: text[]`
- `industry: text[]` (array)

**Metrics** (`prod_metrics`):
- `formula: text`
- `measure_type: text`
- `related_metrics: text[]`
- `derived_kpis: text[]`
- `industry: text` (string, not array)

**Dimensions** (`prod_dimensions`):
- `data_type: text` (enum: 'string' | 'number' | 'counter' | 'boolean' | 'datetime' | 'array' | 'list')
- `related_dimensions: text[]`
- `derived_dimensions: text[]`
- `industry: text` (string, not array)
- ❌ NO `formula` field

**Events** (`prod_events`):
- `formula: text`
- `event_type: text` (enum: 'standard' | 'custom')
- `parameters: text` (JSON string)
- `related_dimensions: text[]`
- `derived_dimensions: text[]`
- `derived_metrics: text[]`
- `derived_kpis: text[]`
- `industry: text` (string, not array)

**Dashboards** (`prod_dashboards`):
- Only basic fields: `name`, `description`, `category`, `tags`
- No technical/business context fields

---

## Recommendation

### ✅ **KEEP SEPARATE TABLES**

**Reasons:**
1. ✅ Better performance (smaller tables, specific indexes)
2. ✅ Schema flexibility (entity-specific fields)
3. ✅ Data integrity (entity-specific constraints)
4. ✅ No migration needed (current structure is good)
5. ✅ Form consolidation doesn't require DB changes

### Form Consolidation Strategy

**UI Layer Only:**
- Create reusable `EntityEditForm` component
- Use field configuration to handle differences
- Keep database tables separate
- Keep API routes separate (or consolidate later)
- Keep GitHub sync as-is (already generic)

**Result:**
- ✅ 70% code reduction in UI layer
- ✅ Better maintainability
- ✅ No database changes
- ✅ No data migration
- ✅ No risk to existing data

---

## Summary

| Aspect | Current State | After Consolidation |
|--------|--------------|---------------------|
| **Database Tables** | 5 separate tables | ✅ 5 separate tables (unchanged) |
| **Table Schemas** | Entity-specific | ✅ Entity-specific (unchanged) |
| **API Routes** | `/api/items/{entity}/{id}` | ✅ Same (or consolidated later) |
| **GitHub Sync** | Generic (handles all) | ✅ Generic (unchanged) |
| **UI Components** | 5 separate EditClient files | ✅ 1 reusable EntityEditForm |
| **Code Lines** | ~4,750 lines | ✅ ~1,500 lines (70% reduction) |

**Conclusion:** Form consolidation is **UI-layer only** and does NOT require any database changes. The separate table structure is optimal and should remain as-is.

