# Architecture and Development Guide

**Last Updated:** 2025-01-27  
**Purpose:** This document defines the architecture, development patterns, and best practices for the OpenKPIs Next.js application. **Always refer to this document before starting any new feature development or bug fixes.**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Architecture](#component-architecture)
3. [API Route Patterns](#api-route-patterns)
4. [Form Handling Patterns](#form-handling-patterns)
5. [Database Patterns](#database-patterns)
6. [GitHub Sync Patterns](#github-sync-patterns)
7. [Type Safety](#type-safety)
8. [Code Organization](#code-organization)
9. [Development Workflow](#development-workflow)
10. [Best Practices](#best-practices)
11. [Common Patterns](#common-patterns)
12. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Core Principles

1. **Consolidation First**: Always consolidate similar functionality across entity types before creating separate implementations
2. **Configuration-Driven**: Use configuration objects to drive UI and behavior rather than hardcoding
3. **Type Safety**: Maintain strict TypeScript typing throughout
4. **Single Source of Truth**: One component/service handles all entity types, not separate implementations
5. **Separation of Concerns**: Keep business logic separate from UI components

### Entity Types

The application supports 5 entity types:
- **KPI** (Key Performance Indicators)
- **Metric** (Business Metrics)
- **Dimension** (Data Dimensions)
- **Event** (Platform Events)
- **Dashboard** (Data Dashboards)

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Version Control**: Git with GitHub
- **Deployment**: Vercel

---

## Component Architecture

### Consolidated Components (MUST USE)

#### 1. EntityCreateForm

**Location:** `components/forms/EntityCreateForm.tsx`

**Purpose:** Single component for creating all entity types

**Usage:**
```typescript
// In route file: app/(content)/kpis/new/page.tsx
import EntityCreateForm from '@/components/forms/EntityCreateForm';

export default function NewKPIPage() {
  return <EntityCreateForm entityType="kpi" />;
}
```

**Key Points:**
- Accepts `entityType` prop: `'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard'`
- Uses `useItemForm` hook for form logic
- Configuration-driven via `ENTITY_CONFIG` object
- Handles `formula` vs `event_serialization` based on entity type
- **DO NOT** create separate create form components for each entity type

#### 2. EntityEditForm

**Location:** `components/forms/EntityEditForm.tsx`

**Purpose:** Single component for editing all entity types

**Usage:**
```typescript
// In route file: app/(content)/kpis/[slug]/edit/page.tsx
import EntityEditForm from '@/components/forms/EntityEditForm';

export default async function KPIEditPage({ params }) {
  const kpi = await fetchKpiBySlug(admin, slug);
  return (
    <EntityEditForm
      entity={kpi}
      entityType="kpi"
      slug={slug}
      canEdit={canEditDraft}
      entityId={kpi.id}
    />
  );
}
```

**Key Points:**
- Accepts normalized entity data
- Uses `entityFormConfigs.ts` for field configuration
- Handles all field types: text, textarea, select, tags, dependencies, semicolon-list
- Normalizes entity data to form data automatically
- **DO NOT** create separate edit form components for each entity type

### Form Configuration

**Location:** `lib/config/entityFormConfigs.ts`

**Purpose:** Centralized configuration for all entity forms

**Structure:**
```typescript
export const KPI_FORM_CONFIG: EntityFormConfig = {
  entityType: 'kpi',
  entityName: 'KPI',
  tabs: ['Basic Info', 'Business Context', ...],
  fields: [...],
  apiEndpoint: (id) => `/api/items/kpi/${id}`,
  redirectPath: (slug) => `/kpis/${slug}`,
  backPath: (slug) => `/kpis/${slug}`,
};
```

**Key Points:**
- Each entity type has its own config
- Configs can inherit from base config using spread operator
- Fields have `condition` functions for entity-specific display
- Tabs are explicitly defined (required for proper rendering)
- **ALWAYS** explicitly set `tabs` array in configs

### Detail Pages (Intentionally Separate)

**Location:** `app/(content)/[entity]/[slug]/page.tsx`

**Purpose:** Entity-specific detail pages for customization

**Key Points:**
- Detail pages are **intentionally kept separate** for customization
- Each entity type can have unique display logic
- Use server components for data fetching
- Client components only when needed for interactivity

---

## API Route Patterns

### Consolidated Routes (MUST USE)

#### 1. Create Route

**Location:** `app/api/items/create/route.ts`

**Purpose:** Single route for creating all entity types

**Pattern:**
```typescript
export async function POST(request: NextRequest) {
  const { type, ...data } = await request.json();
  
  // Validate type
  if (!['kpi', 'metric', 'dimension', 'event', 'dashboard'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }
  
  // Handle entity-specific logic
  if (type === 'event') {
    // Events use event_serialization, not formula
    delete data.formula;
  } else {
    // Other entities use formula
    delete data.event_serialization;
  }
  
  // Create in database
  // Sync to GitHub if needed
}
```

**Key Points:**
- Single route handles all entity types
- Type validation required
- Entity-specific field handling (formula vs event_serialization)
- **DO NOT** create separate create routes for each entity type

#### 2. Update Route

**Location:** `app/api/items/[kind]/[id]/route.ts`

**Purpose:** Single route for updating all entity types

**Pattern:**
```typescript
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  const { kind, id } = await params;
  
  // Validate kind
  if (!isEntityKind(kind)) {
    return NextResponse.json({ error: 'Unsupported entity type' }, { status: 400 });
  }
  
  // Use consolidated update service
  const result = await updateEntityDraftAndSync({
    kind,
    id,
    data: body.data,
    user,
    userClient: supabase,
  });
}
```

**Key Points:**
- Single route handles all entity types via `[kind]` parameter
- Uses `updateEntityDraftAndSync` service function
- **DO NOT** create separate update routes for each entity type

#### 3. GitHub Sync Route

**Location:** `app/api/items/[kind]/[id]/sync-github/route.ts`

**Purpose:** Single route for GitHub sync of all entity types

**Pattern:**
```typescript
const TABLE_CONFIG: Record<EntityKind, { table: string; tableName: string }> = {
  kpi: { table: withTablePrefix('kpis'), tableName: 'kpis' },
  metric: { table: withTablePrefix('metrics'), tableName: 'metrics' },
  // ... other entities
};

export async function POST(request, { params }) {
  const { kind, id } = await params;
  const config = TABLE_CONFIG[kind];
  
  // Fetch entity
  const entity = await admin.from(config.table).select('*').eq('id', id).single();
  
  // Sync to GitHub
  const result = await syncToGitHub({
    tableName: config.tableName,
    record: entity as EntityRecord,
    // ... other params
  });
}
```

**Key Points:**
- Single route handles all entity types
- Uses `TABLE_CONFIG` for entity-to-table mapping
- Casts entity to `EntityRecord` type
- **DO NOT** create separate sync routes for each entity type

### Route Structure

```
app/api/
├── items/
│   ├── create/route.ts              # Create all entity types
│   └── [kind]/
│       ├── [id]/route.ts            # Update entity
│       └── [id]/sync-github/route.ts # GitHub sync
├── editor/
│   ├── publish/route.ts             # Publish items
│   └── reject/route.ts               # Reject items
└── ...
```

---

## Form Handling Patterns

### useItemForm Hook

**Location:** `hooks/useItemForm.ts`

**Purpose:** Shared form logic for create forms

**Key Points:**
- Handles form state management
- Manages GitHub fork preference
- Handles form submission
- Redirects after creation
- **DO NOT** duplicate this logic in individual forms

### Form Data Normalization

**Pattern:** Always normalize entity data to form data

```typescript
function normalizeEntityToFormData(entity, entityType) {
  const baseData = {
    name: entity.name || '',
    description: entity.description || '',
    // ... base fields
  };
  
  // Entity-specific normalization
  if (entityType === 'kpi') {
    return {
      ...baseData,
      formula: entity.formula || '',
      // ... KPI-specific fields
    };
  }
  
  if (entityType === 'event') {
    return {
      ...baseData,
      event_serialization: entity.event_serialization || '',
      // NO formula field for events
    };
  }
}
```

**Key Points:**
- Normalize in `EntityEditForm` component
- Handle entity-specific fields (formula vs event_serialization)
- Convert arrays to semicolon-separated strings for display
- Convert JSONB dependencies to structured objects

### Field Type Handling

**Supported Field Types:**
- `text` - Single line input
- `textarea` - Multi-line input
- `select` - Dropdown selection
- `checkbox` - Boolean checkbox
- `tags` - Array of tags
- `dependencies` - JSONB structure with Events, Metrics, Dimensions, KPIs
- `semicolon-list` - Semicolon-separated string (displayed as array)

---

## Database Patterns

### Table Naming

**Pattern:** Environment-prefixed tables

```typescript
// Development: dev_kpis, dev_metrics, etc.
// Production: prod_kpis, prod_metrics, etc.

const table = withTablePrefix('kpis'); // Returns 'dev_kpis' or 'prod_kpis'
```

**Function:** `withTablePrefix()` from `@/src/types/entities`

### Data Fetching

**Pattern:** Server-side fetching with normalization

```typescript
// lib/server/kpis.ts
export async function fetchKpiBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<NormalizedKpi | null> {
  const { data, error } = await supabase
    .from(withTablePrefix('kpis'))
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  
  if (error || !data) return null;
  
  return normalizeKpi(data);
}
```

**Key Points:**
- Always use `select('*')` to get all fields
- Normalize data after fetching
- Return `null` if not found
- Use `maybeSingle()` for single record queries

### Data Updates

**Pattern:** Use consolidated update service

```typescript
// lib/services/entityUpdates.ts
export async function updateEntityDraftAndSync({
  kind,
  id,
  data,
  user,
  userClient,
}) {
  // Build payload based on entity type
  const payload = buildPayload(kind, data, user);
  
  // Update in database
  const { error } = await userClient
    .from(withTablePrefix(tableFor(kind)))
    .update(payload)
    .eq('id', id);
  
  // Handle errors
  // Return result
}
```

**Key Points:**
- Use payload builders for each entity type
- Handle entity-specific fields (formula vs event_serialization)
- Update `last_modified_by` and `last_modified_at`
- Return consistent response format

---

## GitHub Sync Patterns

### syncToGitHub Function

**Location:** `lib/services/github.ts`

**Purpose:** Centralized GitHub sync logic

**Pattern:**
```typescript
export async function syncToGitHub(params: GitHubSyncParams): Promise<SyncResult> {
  // Determine contribution mode (fork_pr, internal_app, editor_direct)
  // Fetch/create fork if needed
  // Create branch
  // Commit file
  // Create PR
  // Return result
}
```

**Key Points:**
- Handles all contribution modes
- Supports fork+PR and app-based approaches
- Generates YAML from entity data
- Updates Supabase with GitHub metadata

### EntityRecord Interface

**Location:** `lib/services/github.ts`

**Purpose:** Type definition for GitHub sync records

**Key Points:**
- Exported interface (must be imported, not redefined)
- Accepts all entity types
- Fields are optional to support different entity structures
- Used for type casting in sync routes

### YAML Generation

**Pattern:** Generate YAML from entity record

```typescript
function generateYAML(record: EntityRecord, tableName: string): string {
  // Build YAML structure
  // Handle entity-specific fields
  // Format arrays and JSONB fields
  // Return YAML string
}
```

**Key Points:**
- All form fields must be included in YAML
- Handle entity-specific fields (formula vs event_serialization)
- Format arrays as YAML lists
- Format JSONB as YAML objects

---

## Type Safety

### Entity Types

**Location:** `lib/types/database.ts`

**Purpose:** TypeScript interfaces for database entities

**Key Points:**
- Each entity type has its own interface
- Events use `event_serialization`, not `formula`
- All entities share common fields (id, slug, name, status, etc.)
- Status includes `'rejected'` option

### Normalized Types

**Location:** `lib/server/[entity].ts`

**Purpose:** Normalized entity types after data fetching

**Pattern:**
```typescript
export type NormalizedKpi = Omit<KpiRow, 'tags'> & {
  tags: string[]; // Always array, never null
};
```

**Key Points:**
- Normalize after fetching from database
- Ensure consistent types (arrays, not null)
- Use in components for type safety

### EntityRecord Type

**Location:** `lib/services/github.ts`

**Purpose:** Type for GitHub sync records

**Key Points:**
- Exported interface (import, don't redefine)
- Accepts all entity types
- Used for type casting in sync routes

---

## Code Organization

### Directory Structure

```
openkpis-next/
├── app/
│   ├── (content)/              # Public content routes
│   │   ├── kpis/
│   │   │   ├── new/page.tsx    # Create route (uses EntityCreateForm)
│   │   │   └── [slug]/
│   │   │       ├── page.tsx    # Detail page (entity-specific)
│   │   │       └── edit/page.tsx # Edit route (uses EntityEditForm)
│   │   └── ... (similar for other entities)
│   └── api/
│       └── items/
│           ├── create/route.ts
│           └── [kind]/
│               ├── [id]/route.ts
│               └── [id]/sync-github/route.ts
├── components/
│   └── forms/
│       ├── EntityCreateForm.tsx  # Consolidated create form
│       ├── EntityEditForm.tsx     # Consolidated edit form
│       └── ... (form field components)
├── lib/
│   ├── config/
│   │   └── entityFormConfigs.ts  # Form configurations
│   ├── server/
│   │   ├── kpis.ts               # KPI data fetching
│   │   ├── metrics.ts
│   │   └── ... (other entities)
│   ├── services/
│   │   ├── github.ts             # GitHub sync logic
│   │   └── entityUpdates.ts      # Update payload builders
│   └── types/
│       └── database.ts            # Entity type definitions
└── hooks/
    └── useItemForm.ts            # Create form hook
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `EntityCreateForm.tsx`)
- **Routes**: lowercase (e.g., `page.tsx`, `route.ts`)
- **Services**: camelCase (e.g., `entityUpdates.ts`)
- **Types**: camelCase (e.g., `database.ts`)
- **Configs**: camelCase (e.g., `entityFormConfigs.ts`)

---

## Development Workflow

### Before Starting Work

1. **Read this document** - Understand the architecture
2. **Check existing patterns** - Look for similar functionality
3. **Plan consolidation** - Can this be consolidated with existing code?
4. **Review related files** - Understand the full context

### Adding New Features

1. **Check for consolidated components first**
   - Can you use `EntityCreateForm` or `EntityEditForm`?
   - Can you use consolidated API routes?
   - **DO NOT** create separate implementations

2. **Update configurations, not components**
   - Add fields to `entityFormConfigs.ts`
   - Update payload builders in `entityUpdates.ts`
   - Extend types in `database.ts`

3. **Follow existing patterns**
   - Use same structure as existing code
   - Maintain type safety
   - Keep code DRY (Don't Repeat Yourself)

### Fixing Bugs

1. **Identify the root cause**
   - Check consolidated components first
   - Verify configuration is correct
   - Check type definitions

2. **Fix in the right place**
   - Fix in consolidated component, not individual files
   - Update configuration if needed
   - Ensure fix applies to all entity types

3. **Test all entity types**
   - Don't just test the reported entity type
   - Verify fix doesn't break other entities
   - Check related functionality

---

## Best Practices

### DO's

✅ **DO** use consolidated components (`EntityCreateForm`, `EntityEditForm`)  
✅ **DO** use consolidated API routes (`/api/items/[kind]/[id]`)  
✅ **DO** update configurations instead of creating new components  
✅ **DO** maintain type safety throughout  
✅ **DO** normalize data after fetching from database  
✅ **DO** handle entity-specific fields (formula vs event_serialization)  
✅ **DO** explicitly set `tabs` array in form configurations  
✅ **DO** use `select('*')` when fetching entities  
✅ **DO** export types that are used across files  
✅ **DO** test all entity types when making changes  

### DON'Ts

❌ **DON'T** create separate form components for each entity type  
❌ **DON'T** create separate API routes for each entity type  
❌ **DON'T** duplicate form logic  
❌ **DON'T** hardcode entity-specific logic in components  
❌ **DON'T** forget to handle `formula` vs `event_serialization`  
❌ **DON'T** skip type definitions  
❌ **DON'T** forget to normalize data  
❌ **DON'T** test only one entity type  
❌ **DON'T** create deprecated files without removing old ones  

---

## Common Patterns

### Adding a New Field to All Entities

1. Add field to database type in `lib/types/database.ts`
2. Add field to form config in `lib/config/entityFormConfigs.ts`
3. Add field to payload builder in `lib/services/entityUpdates.ts`
4. Add field to normalization in `EntityEditForm.tsx`
5. Add field to YAML generation in `lib/services/github.ts`
6. Update database schema if needed

### Adding Entity-Specific Field

1. Add field to entity type in `lib/types/database.ts`
2. Add field to form config with `condition` function
3. Add field to entity-specific payload builder
4. Add field to entity-specific normalization
5. Add field to YAML generation with condition

### Handling Formula vs Event Serialization

```typescript
// In create form
{entityType !== 'event' && (
  <FormField label="Formula">
    <TextInput value={formData.formula} />
  </FormField>
)}

{entityType === 'event' && (
  <FormField label="Event Serialization">
    <TextInput value={formData.event_serialization} />
  </FormField>
)}

// In API route
if (type === 'event') {
  delete data.formula;
  // Include event_serialization
} else {
  delete data.event_serialization;
  // Include formula
}
```

---

## Troubleshooting

### Issue: Form shows only 4 fields

**Cause:** Tabs array not explicitly set in form config

**Fix:** Add explicit `tabs` array to form configuration:
```typescript
export const DIMENSION_FORM_CONFIG: EntityFormConfig = {
  ...KPI_FORM_CONFIG,
  tabs: ['Basic Info', 'Business Context', ...], // Explicitly set
};
```

### Issue: Type error with EntityRecord

**Cause:** EntityRecord not exported or incorrectly imported

**Fix:** Import from `lib/services/github.ts`:
```typescript
import type { EntityRecord } from '@/lib/services/github';
```

### Issue: GitHub sync fails for one entity type

**Cause:** Missing table mapping or incorrect type casting

**Fix:** Verify entity is in `TABLE_CONFIG` and cast to `EntityRecord`:
```typescript
const config = TABLE_CONFIG[entityKind];
const entity = await admin.from(config.table).select('*').eq('id', id).single();
const result = await syncToGitHub({
  record: entity as EntityRecord,
  // ...
});
```

### Issue: Formula field shows for Events

**Cause:** Form config not filtering out formula for events

**Fix:** Filter formula field in `EVENT_FORM_CONFIG`:
```typescript
fields: KPI_FORM_CONFIG.fields.filter(field => field.name !== 'formula')
```

### Issue: Build fails with missing type

**Cause:** Type not exported or incorrectly imported

**Fix:** 
1. Check if type is exported
2. Verify import path is correct
3. Check if type exists in the file

---

## Quick Reference

### Entity Type Checklist

When working with entities, ensure:
- [ ] Form config exists in `entityFormConfigs.ts`
- [ ] Payload builder exists in `entityUpdates.ts`
- [ ] Server fetch function exists in `lib/server/[entity].ts`
- [ ] Type definition exists in `lib/types/database.ts`
- [ ] Table mapping exists in `TABLE_CONFIG`
- [ ] YAML generation handles entity-specific fields

### Form Field Checklist

When adding a field:
- [ ] Added to form config with correct type
- [ ] Added to payload builder
- [ ] Added to normalization function
- [ ] Added to YAML generation
- [ ] Added to database type
- [ ] Tested in create form
- [ ] Tested in edit form
- [ ] Tested in detail page (if displayed)

### API Route Checklist

When creating/modifying API route:
- [ ] Uses consolidated route if possible
- [ ] Validates entity type/kind
- [ ] Handles authentication
- [ ] Handles entity-specific fields
- [ ] Returns consistent response format
- [ ] Handles errors properly
- [ ] Updates database correctly

---

## Maintenance Notes

### When to Update This Document

- New architectural patterns are established
- New consolidated components are created
- New best practices are identified
- Common issues are discovered and resolved

### Document Review

This document should be reviewed:
- Before major feature development
- After significant architectural changes
- When onboarding new developers
- Quarterly for accuracy

---

**Remember:** Always refer to this document before starting any development work. When in doubt, follow the patterns established here.

---

*This is a living document. Update it as the codebase evolves.*

