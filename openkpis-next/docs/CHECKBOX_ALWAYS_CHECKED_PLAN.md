# Plan: Checkbox Always Checked by Default (Create Flow Only)

## Requirements Summary

1. **Create Flow**:
   - Checkbox should ALWAYS be checked (true) by default
   - User must explicitly uncheck it each time if they don't want fork+PR
   - Database value (`enable_github_fork_contributions`) should NOT influence checkbox state
   - Only user click should change checkbox state
   - Checkbox resets to checked on each page load/navigation

2. **Edit Flow**:
   - Uses `enable_github_fork_contributions` from database (current behavior)
   - No checkbox in edit flow - it's automatic based on saved preference
   - Preference is NOT changed during edit operations

## Current Architecture

### Create Flow
- **Pages**: `/kpis/new`, `/metrics/new`, `/dimensions/new`, `/events/new`, `/dashboards/new`
- **Hook**: `useItemForm` (without `initial` prop)
- **Current Behavior**: Loads preference from API and sets checkbox state
- **API**: `/api/items/create` - saves preference after creation

### Edit Flow
- **Pages**: `/kpis/[slug]/edit`, etc.
- **Function**: `updateEntityDraftAndSync` → `syncToGitHub`
- **Current Behavior**: Reads preference from DB via `getUserContributionMode`
- **No Checkbox**: Edit flow doesn't have a checkbox UI

## Implementation Plan

### Changes Required

1. **`useItemForm` Hook** (`hooks/useItemForm.ts`):
   - **Remove**: API call to load preference (lines 64-94)
   - **Keep**: Initial state as `true` (line 41)
   - **Add**: Logic to detect create vs edit mode
     - If `initial` prop is undefined/empty → **Create mode** → Always checkbox = true
     - If `initial` prop has data → **Edit mode** → Load from API (but edit pages don't use this hook currently)
   - **Result**: Checkbox always starts as `true` in create mode, never loads from API

2. **Create API** (`app/api/items/create/route.ts`):
   - **Keep**: Save preference logic (lines 298-320)
   - **Behavior**: Saves preference based on checkbox state when creating
   - **Note**: This is correct - preference is saved for future edit operations

3. **Edit Flow** (`lib/services/entityUpdates.ts`):
   - **No Changes**: Already uses `getUserContributionMode` which reads from DB
   - **Behavior**: Automatically uses saved preference, no user interaction needed

## Questions for Clarification

1. **Edit Pages**: Currently edit pages use `KPIEditClient` component which doesn't use `useItemForm`. Should edit pages also show a checkbox, or is the automatic behavior (reading from DB) sufficient?

2. **Preference Persistence**: When a user unchecks the checkbox and creates an item, should that preference be saved to the database? (Current behavior: Yes, it saves `enable_github_fork_contributions = false`)

3. **Checkbox Reset**: When user navigates away from create page and comes back, checkbox should reset to checked. Is this correct?

4. **Multiple Items**: If user creates Item 1 with checkbox checked, then creates Item 2 - should Item 2's checkbox also be checked by default (ignoring Item 1's saved preference)?

## Proposed Implementation

### Step 1: Modify `useItemForm` Hook
```typescript
// Detect create vs edit mode
const isCreateMode = !initial || Object.keys(initial).length === 0;

// For create mode: Always checkbox = true, never load from API
// For edit mode: Load from API (if edit pages use this hook)
useEffect(() => {
  if (!user) {
    setForkPreferenceLoading(false);
    return;
  }

  // CREATE MODE: Always true, don't load from API
  if (isCreateMode) {
    setForkPreferenceEnabled(true);
    setForkPreferenceLoading(false);
    return;
  }

  // EDIT MODE: Load from API (if needed)
  // ... existing API call logic
}, [user, isCreateMode]);
```

### Step 2: Verify Create API
- Ensure preference saving logic remains intact
- Preference is saved based on checkbox state at creation time

### Step 3: Verify Edit Flow
- No changes needed - already reads from DB automatically

## Testing Checklist

- [ ] Create page: Checkbox is checked by default
- [ ] Create page: User can uncheck checkbox
- [ ] Create page: User creates item with checkbox checked → Preference saved as `true`
- [ ] Create page: User creates item with checkbox unchecked → Preference saved as `false`
- [ ] Create page: Navigate away and back → Checkbox resets to checked (ignores saved preference)
- [ ] Edit page: Uses saved preference automatically (no checkbox)
- [ ] Edit page: If preference is `true`, uses fork+PR mode
- [ ] Edit page: If preference is `false`, uses bot mode

## Expected Behavior Summary

| Scenario | Checkbox State | Preference Saved | Edit Flow Uses |
|----------|---------------|------------------|----------------|
| Create (checkbox checked) | Always `true` by default | `true` | `fork_pr` |
| Create (user unchecks) | User sets to `false` | `false` | `internal_app` |
| Create (navigate back) | Resets to `true` | - | - |
| Edit (preference = true) | N/A (no checkbox) | Not changed | `fork_pr` |
| Edit (preference = false) | N/A (no checkbox) | Not changed | `internal_app` |

