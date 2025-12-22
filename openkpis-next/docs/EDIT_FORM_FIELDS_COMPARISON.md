# Edit KPI Form - Field Coverage Comparison

This document compares the fields in your requested list with the fields currently available in the Edit KPI Form.

## ✅ Fields Present in Edit Form (with close spelling)

| # | Your Field Name | Form Field Name | Form Label | Status | Notes |
|---|----------------|-----------------|------------|--------|-------|
| 1 | `kpi_name` | `name` | Name | ✅ Present | Placeholder: "KPI Name" |
| 2 | `description` | `description` | Description | ✅ Present | Placeholder: "Short definition and context" |
| 3 | `tags` | `tags` | Tags | ✅ Present | Placeholder: "Free-form labels (e.g., Engagement, Retail, Checkout)" |
| 4 | `formula` | `formula` | Formula | ✅ Present | Placeholder: "Calculation logic in plain text" |
| 5 | `core_area` | `core_area` | Core Area | ✅ Present | Placeholder: "e.g. Digital Analytics, Business Intelligence, Statistics, Data Science & AI etc." |
| 6 | `Source Data` | `Source_Data` | Source Data | ✅ Present | Placeholder: "Digital Analytics, Business Intelligence, ERP, CRM etc." |
| 7 | `report_attribute` | `report_attributes` | Report Attributes | ✅ Present | Note: plural form in DB. Placeholder: "Attributes in GA4/Adobe reports (Dimensions, Metrics, KPIs etc.)" |
| 8 | `dashboard_usage` | `dashboard_usage` | Dashboard Usage | ✅ Present | Placeholder: "Dashboards where KPI appears (e.g., C-Suite, Merchandising, Traffic Analysis etc.)" |
| 9 | `segment_eligibility` | `segment_eligibility` | Segment Eligibility | ✅ Present | Placeholder: "Whether KPI can be used in segmentation (True/False)" |
| 10 | `aggregation_window` | `aggregation_window` | Aggregation Window | ✅ Present | Placeholder: "Which aggregation are possible (Event, Session, User, Time based - Hourly/Daily/Monthly/Yearly)" |
| 11 | `xdm_mapping` | `xdm_mapping` | XDM Mapping | ✅ Present | Placeholder: "AEP XDM schema" |
| 12 | `sql_query_example` | `sql_query` | SQL Query | ✅ Present | Note: field name is `sql_query` (not `sql_query_example`). Placeholder: "Standard SQL query" |
| 13 | `calculation_notes` | `calculation_notes` | Calculation Notes | ✅ Present | Placeholder: "Specific caveats, or special considerations" |
| 14 | `ga_events_name` | `ga4_event` | GA4 Event | ✅ Present | Note: field name is `ga4_event`. Placeholder: "Google Analytics 4 event name" |
| 15 | `adobe_analytics_event_name` | `adobe_event` | Adobe Event | ✅ Present | Note: field name is `adobe_event`. Placeholder: "Adobe Analytics event name" |
| 16 | `data_layer_mapping` | `W3_data_layer`, `GA4_data_layer`, `Adobe_client_data_layer` | W3 Data Layer, GA4 Data Layer, Adobe Client Data Layer | ✅ Present | Note: Split into 3 separate fields. Placeholders: "W3C Data Layer mapping (JSON format)", "GA4 Data Layer mapping (JSON format)", "Adobe Client Data Layer mapping (JSON format)" |
| 17 | `dependencies` | `dependencies` | Dependencies | ✅ Present | Structured input with subsections: Events, Metrics, Dimensions, KPIs |
| 18 | `measure_type` | `measure_type` | Measure Type | ✅ Present | Dropdown: Counter, Rate, Ratio, Percentage, Average, Sum |
| 19 | `scope` | `scope` | Scope | ✅ Present | Dropdown: User, Session, Event, Global |
| 20 | `priority` | `priority` | Priority | ✅ Present | Dropdown: High, Medium, Low |
| 21 | `industry` | `industry` | Industry | ✅ Present | Dropdown: Retail, E-commerce, SaaS, Healthcare, Education, Finance, Media, Technology, Manufacturing, Other |
| 22 | `category` | `category` | Category | ✅ Present | Dropdown: Conversion, Revenue, Engagement, Retention, Acquisition, Performance, Quality, Efficiency, Satisfaction, Growth, Other |
| 23 | `related_kpis` | `related_kpis` | Related KPIs | ✅ Present | Placeholder: "Enter KPI separated by semicolons (e.g., add-to-cart;order;revenue)" |

**Total: 23/23 fields from your list are present in the form** ✅

---

## ❌ Fields NOT Present in Edit Form

| # | Your Field Name | Database Field | Status | Notes |
|---|----------------|----------------|--------|-------|
| 1 | `amplitude_event_name` | ❌ Not in DB | ❌ Missing | Amplitude was removed from the system |
| 2 | `kpi_alias` | `aliases` (string[]) | ❌ Missing | Exists in database but not in form |
| 3 | `dimensions` | ❌ Not separate field | ⚠️ Partial | Dimensions are part of `dependencies` (structured JSON) |
| 4 | `metric` | ❌ Not separate field | ⚠️ Partial | Not a separate field; `measure_type` serves similar purpose |
| 5 | `contributed_by` | `created_by` | ⚠️ Auto-managed | Auto-set on creation, not editable |
| 6 | `validation_status` | `validation_status` | ❌ Missing | Exists in database but not in form |
| 7 | `last_updated` | `last_modified_at` | ⚠️ Auto-managed | Auto-updated on save, not editable |
| 8 | `data_sensitivity` | `data_sensitivity` | ❌ Missing | Exists in database but not in form |
| 9 | `pii_flag` | `pii_flag` | ❌ Missing | Exists in database but not in form |
| 10 | `version` | `version` | ❌ Missing | Exists in database but not in form |
| 11 | `deprecation_notes` | ❌ Not in DB | ❌ Missing | Not in database schema |

---

## 📊 Summary

### Fields Coverage
- ✅ **23 fields** from your list are present in the Edit form
- ❌ **11 fields** from your list are NOT present in the Edit form

### Breakdown of Missing Fields

1. **Removed/Deprecated Fields (1)**:
   - `amplitude_event_name` - Amplitude was intentionally removed from the system

2. **Fields in Database but Not in Form (5)**:
   - `kpi_alias` (DB: `aliases`)
   - `validation_status`
   - `data_sensitivity`
   - `pii_flag`
   - `version`

3. **Auto-Managed Fields (2)**:
   - `contributed_by` (DB: `created_by`) - Set automatically on creation
   - `last_updated` (DB: `last_modified_at`) - Updated automatically on save

4. **Fields Not in Database (3)**:
   - `dimensions` - Part of structured `dependencies` JSON
   - `metric` - Covered by `measure_type`
   - `deprecation_notes` - Not in schema

---

## 🔧 Recommendations

### Fields to Add to Edit Form

If you want these fields to be editable, they should be added:

1. **`kpi_alias`** (aliases) - Text input for alternate names/acronyms/synonyms
2. **`validation_status`** - Dropdown: Draft | In Review | Validated | Deprecated
3. **`data_sensitivity`** - Dropdown: Public | Internal | Restricted
4. **`pii_flag`** - Checkbox: true/false
5. **`version`** - Text input for version number (e.g., v1, v2)

### Fields That Are Auto-Managed (No Action Needed)

- `contributed_by` / `created_by` - Set automatically
- `last_updated` / `last_modified_at` - Updated automatically

### Fields That Don't Need Separate Input

- `dimensions` - Already part of structured `dependencies` field
- `metric` - Covered by `measure_type` field
- `amplitude_event_name` - Intentionally removed

---

## 📝 Notes on Field Name Differences

| Your Field Name | Form/Database Field Name | Reason |
|----------------|-------------------------|--------|
| `kpi_name` | `name` | Standard naming convention |
| `ga_events_name` | `ga4_event` | More specific (GA4 vs generic GA) |
| `adobe_analytics_event_name` | `adobe_event` | Shorter, clearer name |
| `sql_query_example` | `sql_query` | Removed "example" suffix |
| `report_attribute` | `report_attributes` | Plural form (can contain multiple attributes) |
| `data_layer_mapping` | `W3_data_layer`, `GA4_data_layer`, `Adobe_client_data_layer` | Split into 3 platform-specific fields for better organization |

---

## ✅ Conclusion

**All 23 fields from your list that should be editable are present in the Edit form** with appropriate placeholders and input types. The missing fields are either:
- Auto-managed (not meant to be edited)
- Intentionally removed (Amplitude)
- Part of structured fields (dimensions in dependencies)
- Exist in database but not yet added to form UI

