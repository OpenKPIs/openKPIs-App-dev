# GitHub YAML Sync Process

## Overview
This document defines the process to ensure all entity fields from create/edit forms are properly synced to GitHub YAML files.

## Problem Statement
Fields added to create/edit forms must be:
1. Included in the payload builder (`lib/services/entityUpdates.ts`)
2. Included in the YAML generation (`lib/services/github.ts`)
3. Properly formatted in the YAML output

## Field Mapping Process

### Step 1: Identify All Fields
For each entity type (KPI, Metric, Dimension, Event), identify all fields from:
- Edit form: `app/(content)/[entity]/[slug]/edit/[Entity]EditClient.tsx`
- Create form: `app/(content)/[entity]/new/page.tsx`
- Payload builder: `lib/services/entityUpdates.ts` → `[ENTITY]_FIELDS`

### Step 2: Verify Payload Builder
Ensure all form fields are included in the corresponding payload builder:
- `KPI_FIELDS` for KPIs
- `METRIC_FIELDS` for Metrics
- `DIMENSION_FIELDS` for Dimensions
- `EVENT_FIELDS` for Events

### Step 3: Verify YAML Generation
Ensure all payload builder fields are included in `generateYAML()` function in `lib/services/github.ts`:
- Check the corresponding `if (tableName === '[entity]')` block
- Verify field formatting (multiline vs single line, array vs string)
- Handle both capitalized and lowercase field name variants (e.g., `Business_Use_Case` vs `business_use_case`)

### Step 4: Field Name Variants
Some fields may exist in both formats:
- `Business_Use_Case` / `business_use_case`
- `Source_Data` / `source_data`

Always check both variants: `record.business_use_case || record.Business_Use_Case`

## Field Categories

### Core Fields (All Entities)
- `name` - Entity name
- `description` - Description (multiline)
- `category` - Category
- `tags` - Tags (array)
- `status` - Status
- `created_by` - Contributor
- `created_at` - Creation timestamp
- `last_modified_by` - Last editor
- `last_modified_at` - Last modification timestamp

### KPI-Specific Fields
- `formula` - Formula
- `industry` - Industry (array)
- `priority` - Priority
- `core_area` - Core Area
- `scope` - Scope
- `measure_type` - Measure Type
- `aggregation_window` - Aggregation Window
- `ga4_event` - GA4 Event (multiline)
- `adobe_event` - Adobe Event (multiline)
- `w3_data_layer` - W3 Data Layer (multiline)
- `ga4_data_layer` - GA4 Data Layer (multiline)
- `adobe_client_data_layer` - Adobe Client Data Layer (multiline)
- `xdm_mapping` - XDM Mapping (multiline)
- `sql_query` - SQL Query (multiline)
- `calculation_notes` - Calculation Notes (multiline)
- `business_use_case` - Business Use Case (multiline)
- `dependencies` - Dependencies (multiline JSON)
- `source_data` - Source Data
- `report_attributes` - Report Attributes (multiline)
- `dashboard_usage` - Dashboard Usage (array)
- `segment_eligibility` - Segment Eligibility (multiline)
- `related_kpis` - Related KPIs (array)
- `data_sensitivity` - Data Sensitivity
- `pii_flag` - Contains PII (boolean → "Yes"/"No")

### Metric-Specific Fields
All KPI fields EXCEPT:
- `related_kpis` → replaced with `related_metrics`
- `derived_kpis` - Derived KPIs (array, NEW)
- `industry` - Industry (string, not array)

### Dimension-Specific Fields
All KPI fields EXCEPT:
- `formula` - NOT present
- `measure_type` → replaced with `data_type`
- `related_kpis` → replaced with `related_dimensions`
- `derived_dimensions` - Derived Dimensions (array, NEW)
- `industry` - Industry (string, not array)

### Event-Specific Fields
All KPI fields EXCEPT:
- `measure_type` → replaced with `event_type`
- `related_kpis` → replaced with `related_dimensions`
- `derived_dimensions` - Derived Dimensions (array, NEW)
- `derived_metrics` - Derived Metrics (array, NEW)
- `derived_kpis` - Derived KPIs (array, NEW)
- `parameters` - Parameters (multiline JSON, NEW)
- `industry` - Industry (string, not array)

## Formatting Rules

### Multiline Fields
Use `formatField(label, value, true)` for:
- `description`
- `ga4_event`
- `adobe_event`
- `w3_data_layer`
- `ga4_data_layer`
- `adobe_client_data_layer`
- `xdm_mapping`
- `sql_query`
- `calculation_notes`
- `business_use_case`
- `dependencies`
- `report_attributes`
- `segment_eligibility`
- `parameters` (Events only)

### Array Fields
Use `formatArray(value)` for:
- `tags`
- `industry` (KPIs only - array)
- `dashboard_usage`
- `related_kpis` (KPIs)
- `related_metrics` (Metrics)
- `related_dimensions` (Dimensions, Events)
- `derived_kpis` (Metrics, Events)
- `derived_dimensions` (Dimensions, Events)
- `derived_metrics` (Events)

### Boolean Fields
Convert to "Yes"/"No":
- `pii_flag` → `record.pii_flag ? 'Yes' : record.pii_flag === false ? 'No' : ''`

## Checklist for Adding New Fields

When adding a new field to any entity:

- [ ] Add field to edit form (`[Entity]EditClient.tsx`)
- [ ] Add field to create form (`[entity]/new/page.tsx`)
- [ ] Add field to payload builder (`[ENTITY]_FIELDS` in `entityUpdates.ts`)
- [ ] Add field to `EntityRecord` interface in `github.ts` (if new field type)
- [ ] Add field to YAML generation in `generateYAML()` function
- [ ] Use correct formatting (multiline, array, or simple)
- [ ] Handle field name variants (capitalized vs lowercase)
- [ ] Test create flow - verify field appears in YAML
- [ ] Test edit flow - verify field appears in YAML
- [ ] Verify field appears in detail page

## Testing Process

1. **Create Test**: Create a new entity with all fields populated
2. **Verify YAML**: Check the generated PR YAML file contains all fields
3. **Edit Test**: Edit the entity and change field values
4. **Verify YAML**: Check the updated PR YAML file reflects changes
5. **Compare**: Compare form fields with YAML fields to ensure nothing is missing

## Common Issues

### Issue 1: Duplicate Entity Blocks
**Problem**: Multiple `if (tableName === '[entity]')` blocks - first one returns early
**Solution**: Remove incomplete/duplicate blocks, keep only the complete one

### Issue 2: Field Name Variants
**Problem**: Field exists as both `Business_Use_Case` and `business_use_case`
**Solution**: Always check both: `record.business_use_case || record.Business_Use_Case`

### Issue 3: Missing Array Formatting
**Problem**: Array field displayed as string
**Solution**: Use `formatArray()` helper function

### Issue 4: Missing Multiline Formatting
**Problem**: Multiline text displayed on single line
**Solution**: Use `formatField(label, value, true)` with multiline flag

## Maintenance

This process should be reviewed whenever:
- New fields are added to any entity type
- Field types change (string → array, etc.)
- New entity types are added
- YAML format requirements change

## Related Files

- `lib/services/entityUpdates.ts` - Payload builders
- `lib/services/github.ts` - YAML generation
- `app/(content)/[entity]/[slug]/edit/[Entity]EditClient.tsx` - Edit forms
- `app/(content)/[entity]/new/page.tsx` - Create forms
- `lib/types/database.ts` - TypeScript interfaces

