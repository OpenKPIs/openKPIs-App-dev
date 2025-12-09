# Implementation: Checkbox Always Checked by Default (Create Flow)

## Summary

Implemented the requirement that the checkbox is **always checked by default** in create flow, regardless of any saved preferences. The checkbox state is independent of the database value for create operations.

## Changes Made

### 1. `hooks/useItemForm.ts`

**Key Changes:**
- Added `isCreateMode` detection: Checks if `initial` prop is undefined/empty
- **Create Mode**: Checkbox always starts as `true`, **never loads from API**
- **Edit Mode**: Would load from API (for future compatibility, though edit pages don't currently use this hook)

**Logic:**
```typescript
const isCreateMode = !initial || Object.keys(initial).length === 0;

// CREATE MODE: Always checkbox = true, don't load from API
if (isCreateMode) {
  setForkPreferenceEnabled(true);
  setForkPreferenceLoading(false);
  return;
}
```

## Behavior

### Create Flow

| Scenario | Checkbox State | Preference Saved | Next Create | Edit Flow Uses |
|----------|---------------|------------------|-------------|----------------|
| Page loads | ✅ **Always checked** | - | ✅ Checked | - |
| User unchecks & creates | ❌ Unchecked | `false` | ✅ **Checked** (resets) | `internal_app` |
| User keeps checked & creates | ✅ Checked | `true` | ✅ **Checked** (resets) | `fork_pr` |
| Navigate away & back | ✅ **Checked** (resets) | - | ✅ Checked | - |

### Edit Flow

- **No checkbox** - Uses saved preference automatically
- Preference is read from `enable_github_fork_contributions` in database
- Preference is **not changed** during edit operations
- Uses `getUserContributionMode()` which reads from DB

## Key Points

1. ✅ **Create checkbox always checked**: Never loads from API, always starts as `true`
2. ✅ **User must explicitly uncheck**: If they want bot mode, they must uncheck each time
3. ✅ **Preference saved on create**: Based on checkbox state at creation time
4. ✅ **Preference used for edit**: Edit flow uses saved preference automatically
5. ✅ **Checkbox resets**: Every time user navigates to create page, checkbox is checked

## Testing Checklist

- [x] Create page: Checkbox is checked by default
- [x] Create page: User can uncheck checkbox
- [x] Create page: User creates with checkbox checked → Preference saved as `true`
- [x] Create page: User creates with checkbox unchecked → Preference saved as `false`
- [x] Create page: Navigate away and back → Checkbox resets to checked (ignores saved preference)
- [x] Edit page: Uses saved preference automatically (no checkbox)
- [x] Edit page: If preference is `true`, uses fork+PR mode
- [x] Edit page: If preference is `false`, uses bot mode

## Files Modified

1. `hooks/useItemForm.ts` - Added create mode detection, removed API call for create mode
2. `app/api/items/create/route.ts` - No changes needed (already saves preference correctly)
3. `lib/services/entityUpdates.ts` - No changes needed (already uses saved preference)

## No Changes Needed

- **Edit flow**: Already uses `getUserContributionMode()` which reads from DB
- **Create API**: Already saves preference based on checkbox state
- **SubmitBar component**: No changes needed

