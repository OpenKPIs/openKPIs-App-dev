# Edit Form Consolidation Analysis

## Executive Summary

**Difficulty Level: MODERATE** (3-4 days of work)
**Risk Level: LOW** (GitHub sync is already abstracted)
**Recommendation: ✅ PROCEED** - Benefits outweigh risks

---

## Current State Analysis

### Code Duplication
- **5 separate EditClient components** (~950 lines each = ~4,750 lines total)
- **~85% code duplication** across KPI, Metric, Dimension, Event
- **Dashboard is simpler** (~270 lines, only 4 fields)

### Common Patterns (All Entities Share)
1. ✅ Tab navigation structure (7 tabs)
2. ✅ Form state management (`useState`, `useMemo`)
3. ✅ Dependencies handling (JSONB structure)
4. ✅ Tags input component
5. ✅ Save/error handling logic
6. ✅ Permission checks (`canEdit`)
7. ✅ Navigation (back link, router)

### Entity-Specific Differences

| Entity | Unique Fields | Field Count | Complexity |
|--------|--------------|-------------|------------|
| **KPI** | `formula`, `measure_type`, `related_kpis` | 28 fields | High |
| **Metric** | `formula`, `measure_type`, `related_metrics`, `derived_kpis` | 29 fields | High |
| **Dimension** | `data_type`, `related_dimensions`, `derived_dimensions` (NO formula) | 28 fields | High |
| **Event** | `formula`, `event_type`, `parameters`, `related_dimensions`, `derived_dimensions`, `derived_metrics`, `derived_kpis` | 31 fields | Very High |
| **Dashboard** | None (only basic fields) | 4 fields | Low |

### Field Mapping by Tab

**Tab 0: Basic Info** (All entities)
- `name`, `description`, `category`, `tags`

**Tab 1: Business Context** (KPI, Metric, Dimension, Event)
- `industry`, `priority`, `core_area`, `scope`
- Entity-specific: `related_kpis` (KPI), `related_metrics` (Metric), `related_dimensions` (Dimension/Event)
- `source_data`, `dependencies`, `report_attributes`, `dashboard_usage`, `segment_eligibility`
- `data_sensitivity`, `pii_flag`

**Tab 2: Technical** (KPI, Metric, Dimension, Event)
- KPI/Metric: `measure_type`, `aggregation_window`
- Dimension: `data_type`, `aggregation_window`
- Event: `event_type`, `aggregation_window`

**Tab 3: Platform Events** (KPI, Metric, Dimension, Event)
- `ga4_event`, `adobe_event`

**Tab 4: Data Mappings** (KPI, Metric, Dimension, Event)
- `w3_data_layer`, `ga4_data_layer`, `adobe_client_data_layer`, `xdm_mapping`

**Tab 5: SQL** (KPI, Metric, Dimension, Event)
- `sql_query`

**Tab 6: Documentation** (KPI, Metric, Dimension, Event)
- `calculation_notes`, `business_use_case`
- Event also has: `parameters` (in this tab)

**Special: Formula Field**
- Present in: KPI, Metric, Event
- Absent in: Dimension, Dashboard

**Special: Derived Fields** (Event only, shown in Business Context)
- `derived_dimensions`, `derived_metrics`, `derived_kpis`

---

## GitHub Sync Risk Assessment

### ✅ LOW RISK - Already Abstracted

1. **GitHub Service (`lib/services/github.ts`)**
   - ✅ Uses generic `tableName` parameter: `'kpis' | 'events' | 'dimensions' | 'metrics' | 'dashboards'`
   - ✅ `generateYAML()` function already handles all entity types
   - ✅ `EntityRecord` interface already includes all fields
   - ✅ No entity-specific logic in GitHub sync

2. **Update Service (`lib/services/entityUpdates.ts`)**
   - ✅ `updateEntityDraftAndSync()` is already generic
   - ✅ Uses `PAYLOAD_BUILDERS` map for entity-specific payloads
   - ✅ Takes `kind` parameter: `'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard'`

3. **API Routes**
   - Currently: `/api/items/{entity}/{id}` (entity-specific)
   - Can remain separate OR be consolidated
   - **Recommendation**: Keep separate for now (lower risk)

### Risk Mitigation
- ✅ GitHub sync logic is **completely independent** of form structure
- ✅ Only requires: `tableName`, `record` (object with all fields)
- ✅ Form changes won't affect GitHub sync as long as field names match

---

## Proposed Architecture

### Option 1: Configuration-Based Component (Recommended)

```typescript
// components/forms/EntityEditForm.tsx
type EntityType = 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';

type FieldConfig = {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'tags' | 'dependencies';
  label: string;
  tab: number;
  required?: boolean;
  options?: string[];
  condition?: (entityType: EntityType) => boolean;
};

type EntityFormConfig = {
  entityType: EntityType;
  tabs: string[];
  fields: FieldConfig[];
  apiEndpoint: (id: string) => string;
  redirectPath: (slug: string) => string;
};

// Usage
<EntityEditForm
  entity={dimension}
  config={DIMENSION_FORM_CONFIG}
  slug={slug}
  canEdit={canEdit}
/>
```

**Pros:**
- ✅ Single source of truth
- ✅ Easy to add new entities
- ✅ Type-safe
- ✅ Maintainable

**Cons:**
- ⚠️ Initial setup complexity
- ⚠️ Need to define all field configs

### Option 2: Base Component + Entity-Specific Overrides

```typescript
// components/forms/BaseEntityEditForm.tsx
// Handles: tabs, state, save logic, common fields

// app/(content)/dimensions/[slug]/edit/DimensionEditForm.tsx
// Extends BaseEntityEditForm, adds dimension-specific fields
```

**Pros:**
- ✅ More flexible
- ✅ Easier migration path
- ✅ Can keep some entity-specific logic

**Cons:**
- ⚠️ Still some duplication
- ⚠️ More files to maintain

### Option 3: Hybrid Approach (Best Balance)

```typescript
// components/forms/EntityEditForm.tsx - Core component
// lib/config/entityFormConfigs.ts - Field configurations
// app/(content)/{entity}/[slug]/edit/page.tsx - Thin wrapper
```

**Structure:**
```
components/
  forms/
    EntityEditForm.tsx          # Core reusable component
    EntityEditTabs.tsx          # Tab navigation
    EntityEditFields.tsx        # Field rendering
lib/
  config/
    entityFormConfigs.ts        # Field definitions per entity
app/(content)/
  {entity}/
    [slug]/
      edit/
        page.tsx                # Server component (permissions)
        EntityEditClient.tsx    # Thin wrapper (optional)
```

---

## Implementation Plan

### Phase 1: Create Core Component (2 days)
1. Create `EntityEditForm` base component
2. Extract common logic (tabs, state, save)
3. Create field configuration system
4. Implement field renderer with conditional logic

### Phase 2: Migrate One Entity (1 day)
1. Start with **Dashboard** (simplest, lowest risk)
2. Test thoroughly
3. Verify GitHub sync works

### Phase 3: Migrate Remaining Entities (1 day)
1. Migrate KPI, Metric, Dimension, Event
2. Test each entity type
3. Verify all fields render correctly
4. Test GitHub sync for each

### Phase 4: Cleanup & Documentation (0.5 days)
1. Remove old EditClient files
2. Update documentation
3. Add TypeScript types

---

## Field Configuration Example

```typescript
// lib/config/entityFormConfigs.ts

export const KPI_FORM_CONFIG: EntityFormConfig = {
  entityType: 'kpi',
  tabs: ['Basic Info', 'Business Context', 'Technical', 'Platform Events', 'Data Mappings', 'SQL', 'Documentation'],
  fields: [
    // Tab 0: Basic Info
    { name: 'name', type: 'text', label: 'Name', tab: 0, required: true },
    { name: 'description', type: 'textarea', label: 'Description', tab: 0 },
    { name: 'category', type: 'select', label: 'Category', tab: 0, options: CATEGORIES },
    { name: 'tags', type: 'tags', label: 'Tags', tab: 0 },
    
    // Tab 1: Business Context
    { name: 'industry', type: 'select', label: 'Industry', tab: 1, options: INDUSTRIES },
    { name: 'priority', type: 'select', label: 'Priority', tab: 1, options: PRIORITIES },
    { name: 'core_area', type: 'text', label: 'Core Area', tab: 1 },
    { name: 'scope', type: 'select', label: 'Scope', tab: 1, options: SCOPES },
    { name: 'related_kpis', type: 'text', label: 'Related KPIs', tab: 1, condition: (t) => t === 'kpi' },
    
    // Tab 2: Technical
    { name: 'formula', type: 'textarea', label: 'Formula', tab: 2, condition: (t) => ['kpi', 'metric', 'event'].includes(t) },
    { name: 'measure_type', type: 'select', label: 'Measure Type', tab: 2, options: KPI_TYPES, condition: (t) => ['kpi', 'metric'].includes(t) },
    { name: 'data_type', type: 'select', label: 'Data Type', tab: 2, options: DATA_TYPES, condition: (t) => t === 'dimension' },
    { name: 'event_type', type: 'select', label: 'Event Type', tab: 2, options: EVENT_TYPES, condition: (t) => t === 'event' },
    { name: 'aggregation_window', type: 'text', label: 'Aggregation Window', tab: 2 },
    
    // ... more fields
  ],
  apiEndpoint: (id) => `/api/items/kpi/${id}`,
  redirectPath: (slug) => `/kpis/${slug}`,
};
```

---

## Testing Strategy

### Unit Tests
- ✅ Field rendering based on config
- ✅ Conditional field visibility
- ✅ Form state management
- ✅ Validation logic

### Integration Tests
- ✅ Save functionality for each entity
- ✅ GitHub sync for each entity type
- ✅ YAML generation verification
- ✅ API endpoint calls

### Manual Testing Checklist
- [ ] Create new entity (each type)
- [ ] Edit existing entity (each type)
- [ ] Verify all fields save correctly
- [ ] Verify GitHub PR created
- [ ] Verify YAML content is correct
- [ ] Verify tabs work correctly
- [ ] Verify permissions work

---

## Migration Checklist

### Pre-Migration
- [ ] Backup current EditClient files
- [ ] Document all field differences
- [ ] Create feature branch

### During Migration
- [ ] Create core `EntityEditForm` component
- [ ] Create field configuration system
- [ ] Migrate Dashboard first (test)
- [ ] Migrate KPI (test)
- [ ] Migrate Metric (test)
- [ ] Migrate Dimension (test)
- [ ] Migrate Event (test)

### Post-Migration
- [ ] Remove old EditClient files
- [ ] Update imports
- [ ] Test all entity types end-to-end
- [ ] Verify GitHub sync works
- [ ] Update documentation

---

## Benefits

1. **Code Reduction**: ~4,750 lines → ~1,500 lines (70% reduction)
2. **Maintainability**: Fix bugs once, applies to all entities
3. **Consistency**: All entities use same UI/UX patterns
4. **Extensibility**: Easy to add new entities
5. **Type Safety**: Centralized TypeScript types
6. **Testing**: Test once, covers all entities

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking GitHub sync | Low | High | ✅ Already abstracted, test thoroughly |
| Missing fields | Medium | Medium | ✅ Comprehensive field config, test each entity |
| Performance issues | Low | Low | ✅ React optimizations (useMemo, etc.) |
| Migration complexity | Medium | Medium | ✅ Migrate one entity at a time, test each |

---

## Recommendation

**✅ PROCEED with Option 3 (Hybrid Approach)**

**Timeline**: 4-5 days
**Risk**: Low (GitHub sync already abstracted)
**Benefit**: High (70% code reduction, better maintainability)

**Next Steps:**
1. Create feature branch
2. Start with Dashboard (lowest risk)
3. Gradually migrate other entities
4. Test thoroughly at each step

---

## Questions to Consider

1. **Should we keep entity-specific EditClient wrappers?**
   - Recommendation: No, use direct `EntityEditForm` in page.tsx

2. **Should API routes be consolidated?**
   - Recommendation: Keep separate for now (lower risk)

3. **Should we add field validation?**
   - Recommendation: Yes, add to core component

4. **Should we support custom field types?**
   - Recommendation: Start with basic types, extend as needed

