# Entity Type Selection Approach

## Current Implementation

### ✅ **Separate Routes (Current Approach)**

Users **do NOT select entity type from a dropdown**. Instead, they navigate to entity-specific routes:

| Entity Type | Route | Page Component |
|------------|-------|----------------|
| **KPI** | `/kpis/new` | `NewKPIPage` |
| **Metric** | `/metrics/new` | `NewMetricPage` |
| **Dimension** | `/dimensions/new` | `NewDimensionPage` |
| **Event** | `/events/new` | `NewEventPage` |
| **Dashboard** | `/dashboards/new` | `NewDashboardPage` |

**How it works:**
```typescript
// app/(content)/kpis/new/page.tsx
export default function NewKPIPage() {
  const { ... } = useItemForm({
    type: 'kpi',  // ← Entity type is hardcoded in the route
    afterCreateRedirect: ({ slug }) => `/kpis/${slug}/edit`,
  });
  // ...
}
```

**Navigation:**
- Users click "Create KPI" button → goes to `/kpis/new`
- Users click "Create Metric" button → goes to `/metrics/new`
- etc.

---

## Options for Consolidated Form

### Option 1: Keep Separate Routes (Recommended) ✅

**Approach:** Keep current route structure, but use shared form component

```typescript
// app/(content)/kpis/new/page.tsx
export default function NewKPIPage() {
  return <EntityCreateForm 
    entityType="kpi"
    redirectPath={(slug) => `/kpis/${slug}/edit`}
  />;
}

// app/(content)/metrics/new/page.tsx
export default function NewMetricPage() {
  return <EntityCreateForm 
    entityType="metric"
    redirectPath={(slug) => `/metrics/${slug}/edit`}
  />;
}
```

**Pros:**
- ✅ No dropdown needed - entity type determined by URL
- ✅ Better SEO (separate URLs)
- ✅ Clearer user intent
- ✅ Easier to bookmark/share
- ✅ Matches current navigation structure
- ✅ No breaking changes

**Cons:**
- ⚠️ Still need 5 route files (but they're thin wrappers)

**Implementation:**
- Each route file becomes a thin wrapper (5-10 lines)
- Shared `EntityCreateForm` component handles the form
- Entity type passed as prop, not selected by user

---

### Option 2: Unified Route with Dropdown

**Approach:** Single route `/new` with entity type dropdown

```typescript
// app/(content)/new/page.tsx
export default function NewEntityPage() {
  const [entityType, setEntityType] = useState<EntityType | ''>('');
  
  return (
    <main>
      <FormField label="Entity Type" required>
        <Select
          value={entityType}
          onChange={setEntityType}
          options={[
            { label: 'Select entity type...', value: '' },
            { label: 'KPI', value: 'kpi' },
            { label: 'Metric', value: 'metric' },
            { label: 'Dimension', value: 'dimension' },
            { label: 'Event', value: 'event' },
            { label: 'Dashboard', value: 'dashboard' },
          ]}
        />
      </FormField>
      
      {entityType && (
        <EntityCreateForm 
          entityType={entityType}
          redirectPath={(slug) => `/${entityType}s/${slug}/edit`}
        />
      )}
    </main>
  );
}
```

**Pros:**
- ✅ Single route file
- ✅ Users can change entity type without navigating
- ✅ Centralized create page

**Cons:**
- ❌ Extra step for users (select type first)
- ❌ Less SEO-friendly (single URL)
- ❌ Breaks current navigation structure
- ❌ Harder to bookmark/share specific entity types
- ❌ Requires updating all "Create" buttons/links

---

### Option 3: Hybrid - Query Parameter

**Approach:** Single route with optional query parameter

```typescript
// app/(content)/new/page.tsx?type=kpi
export default function NewEntityPage({ searchParams }: { searchParams: { type?: EntityType } }) {
  const entityType = searchParams.type || '';
  
  if (!entityType) {
    // Show entity type selector
    return <EntityTypeSelector />;
  }
  
  return (
    <EntityCreateForm 
      entityType={entityType}
      redirectPath={(slug) => `/${entityType}s/${slug}/edit`}
    />
  );
}
```

**Pros:**
- ✅ Can link directly: `/new?type=kpi`
- ✅ Can show selector if no type provided
- ✅ Flexible

**Cons:**
- ⚠️ More complex routing logic
- ⚠️ Still requires updating navigation
- ⚠️ Less intuitive than separate routes

---

## Recommendation: **Option 1 - Keep Separate Routes** ✅

### Why?

1. **Better UX**
   - Users know what they're creating (no dropdown needed)
   - Clear navigation: "Create KPI" → `/kpis/new`
   - No extra step

2. **Better SEO**
   - Separate URLs for each entity type
   - Better for search engines
   - Better for sharing/bookmarking

3. **No Breaking Changes**
   - Current navigation structure stays the same
   - All existing links continue to work
   - No need to update "Create" buttons

4. **Simpler Implementation**
   - Each route file becomes a thin wrapper (5-10 lines)
   - Entity type is explicit, not selected
   - Less state management

5. **Matches Edit Flow**
   - Edit pages are also entity-specific routes: `/kpis/[slug]/edit`
   - Consistent pattern: Create → `/kpis/new`, Edit → `/kpis/[slug]/edit`

---

## Implementation Plan

### Step 1: Create Shared Component

```typescript
// components/forms/EntityCreateForm.tsx
type EntityCreateFormProps = {
  entityType: EntityType;
  redirectPath: (slug: string) => string;
};

export default function EntityCreateForm({ 
  entityType, 
  redirectPath 
}: EntityCreateFormProps) {
  const { ... } = useItemForm({
    type: entityType,
    afterCreateRedirect: redirectPath,
  });
  
  // Render form based on entityType
  // Use field configuration to show/hide fields
}
```

### Step 2: Update Route Files (Thin Wrappers)

```typescript
// app/(content)/kpis/new/page.tsx
import EntityCreateForm from '@/components/forms/EntityCreateForm';

export default function NewKPIPage() {
  return (
    <EntityCreateForm 
      entityType="kpi"
      redirectPath={(slug) => `/kpis/${slug}/edit`}
    />
  );
}

// app/(content)/metrics/new/page.tsx
import EntityCreateForm from '@/components/forms/EntityCreateForm';

export default function NewMetricPage() {
  return (
    <EntityCreateForm 
      entityType="metric"
      redirectPath={(slug) => `/metrics/${slug}/edit`}
    />
  );
}

// ... repeat for dimensions, events, dashboards
```

### Step 3: Field Configuration

```typescript
// lib/config/entityFormConfigs.ts
export const CREATE_FORM_FIELDS: Record<EntityType, FieldConfig[]> = {
  kpi: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'slug', type: 'slug', label: 'Slug' },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'formula', type: 'text', label: 'Formula' }, // KPI-specific
    { name: 'category', type: 'select', label: 'Category', options: CATEGORIES },
    { name: 'tags', type: 'tags', label: 'Tags' },
  ],
  metric: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'slug', type: 'slug', label: 'Slug' },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'formula', type: 'text', label: 'Formula' }, // Metric-specific
    { name: 'category', type: 'select', label: 'Category', options: CATEGORIES },
    { name: 'tags', type: 'tags', label: 'Tags' },
  ],
  dimension: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'slug', type: 'slug', label: 'Slug' },
    { name: 'description', type: 'textarea', label: 'Description' },
    // NO formula field for dimensions
    { name: 'category', type: 'select', label: 'Category', options: CATEGORIES },
    { name: 'tags', type: 'tags', label: 'Tags' },
  ],
  event: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'slug', type: 'slug', label: 'Slug' },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'formula', type: 'text', label: 'Formula' }, // Event-specific
    { name: 'category', type: 'select', label: 'Category', options: CATEGORIES },
    { name: 'tags', type: 'tags', label: 'Tags' },
  ],
  dashboard: [
    { name: 'name', type: 'text', label: 'Name', required: true },
    { name: 'slug', type: 'slug', label: 'Slug' },
    { name: 'description', type: 'textarea', label: 'Description' },
    { name: 'category', type: 'select', label: 'Category', options: CATEGORIES },
    { name: 'tags', type: 'tags', label: 'Tags' },
  ],
};
```

---

## Summary

### Current State
- ✅ Separate routes: `/kpis/new`, `/metrics/new`, etc.
- ✅ Entity type hardcoded in route
- ✅ No dropdown needed

### After Consolidation (Recommended)
- ✅ **Keep separate routes** (thin wrappers)
- ✅ **Shared `EntityCreateForm` component**
- ✅ **Entity type passed as prop** (not selected)
- ✅ **No dropdown needed** - entity type determined by URL

### Benefits
- ✅ No breaking changes
- ✅ Better UX (no extra step)
- ✅ Better SEO (separate URLs)
- ✅ Consistent with edit flow
- ✅ Code reduction (shared component)

---

## Answer to Your Question

**Q: How will user select KPI, Event or other item type from a dropdown?**

**A: They won't need to!** 

The recommended approach keeps the current navigation structure:
- Users click "Create KPI" → goes to `/kpis/new` → entity type is `'kpi'`
- Users click "Create Event" → goes to `/events/new` → entity type is `'event'`
- etc.

The entity type is determined by the **URL route**, not a dropdown. This is better UX because:
1. Users know what they're creating (no selection step)
2. Clear navigation
3. Better SEO
4. No breaking changes

The consolidated form component receives `entityType` as a prop and renders the appropriate fields based on configuration.

