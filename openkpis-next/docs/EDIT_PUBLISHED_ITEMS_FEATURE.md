# Edit Published Items Feature

**Date:** 2025-01-27  
**Feature:** Allow any authenticated user to edit published items by creating draft versions

---

## Overview

This feature enables any authenticated user to edit published items by creating a draft version. The draft goes through the editorial review process and, when published, updates the original published item.

---

## User Flow

### 1. User Views Published Item
- User navigates to any published item (KPI, Metric, Dimension, Event, Dashboard)
- An "Edit" button is visible to all authenticated users

### 2. User Clicks "Edit"
- Button shows "Creating Draft..." while processing
- System creates a draft version of the published item
- All fields are copied from the published item to the draft
- Draft status is set to `'draft'`
- User is redirected to the edit page for the draft

### 3. User Edits Draft
- User can edit all fields in the draft
- Changes are saved normally (same as regular draft editing)
- Draft appears in the Editorial Review Queue

### 4. Editorial Review
- Editors/Admins see the draft in the review queue
- They can review changes and either:
  - **Publish**: Updates the original published item with draft changes
  - **Reject**: Removes the draft from the queue

### 5. Publishing Draft
- When a draft (created from a published item) is published:
  - System checks if there's an existing published item with the same slug
  - If found, updates the original published item with all draft data
  - Deletes the draft record (no duplicates)
  - If no existing published item, publishes the draft normally
  - Syncs to GitHub with all changes

---

## Implementation Details

### 1. API Endpoint: Create Draft from Published Item

**Route:** `POST /api/items/[kind]/[id]/create-draft`

**Functionality:**
- Validates user authentication
- Fetches the published item
- Checks if a draft already exists (returns existing draft if found)
- Creates a new draft by copying all fields from published item
- Resets metadata (status, created_by, created_at, GitHub fields)
- Returns draft ID and slug

**Key Features:**
- Prevents duplicate drafts (returns existing draft if one exists)
- Copies all fields from published item
- Sets proper metadata for the draft

### 2. Client Component: EditPublishedButton

**File:** `components/EditPublishedButton.tsx`

**Functionality:**
- Shows "Edit" button for published items (any authenticated user)
- Handles draft creation API call
- Shows loading state ("Creating Draft...")
- Displays error messages if draft creation fails
- Redirects to edit page after successful draft creation

**Props:**
- `itemType`: Entity type (kpi, metric, dimension, event, dashboard)
- `itemId`: Published item ID
- `itemSlug`: Published item slug

### 3. Detail Pages Update

**Updated Files:**
- `app/(content)/kpis/[slug]/page.tsx`
- `app/(content)/metrics/[slug]/page.tsx`
- `app/(content)/dimensions/[slug]/page.tsx`
- `app/(content)/events/[slug]/page.tsx`
- `app/(content)/dashboards/[slug]/page.tsx`

**Changes:**
- Added `EditPublishedButton` import
- Updated edit button logic:
  - If `canEdit` (owner + draft): Show regular "Edit" link
  - If `status === 'published'`: Show `EditPublishedButton`
  - Otherwise: No edit button

### 4. Publish Flow Update

**File:** `app/api/editor/publish/route.ts`

**Enhanced Functionality:**
- When publishing a draft:
  1. Checks if there's an existing published item with the same slug
  2. If found:
     - Fetches all data from the draft
     - Updates the original published item with draft data
     - Deletes the draft record
     - Uses original published item's ID for GitHub sync
  3. If not found:
     - Publishes the draft normally (new item)
     - Uses draft's ID for GitHub sync

**Benefits:**
- Prevents duplicate published items
- Maintains single source of truth
- Updates original item with all changes

---

## Database Schema

### No Schema Changes Required

The feature uses existing fields:
- `status`: 'draft' or 'published'
- `slug`: Used to identify related items
- All other fields: Copied from published to draft

### Data Flow

```
Published Item (status: 'published')
    ↓
User clicks "Edit"
    ↓
Draft Created (status: 'draft', same slug)
    ↓
User edits draft
    ↓
Editor reviews draft
    ↓
Editor publishes draft
    ↓
Original Published Item Updated (status: 'published', same slug)
Draft Deleted
```

---

## Security & Permissions

### Authentication
- ✅ Requires authenticated user (GitHub OAuth)
- ✅ Any authenticated user can create draft from published item

### Authorization
- ✅ Draft editing: Same rules as regular drafts (owner or editor)
- ✅ Publishing: Requires admin or editor role (existing check)

### Data Integrity
- ✅ Draft creation: Copies all fields from published item
- ✅ Publishing: Updates original item, prevents duplicates
- ✅ GitHub sync: Uses correct item ID for sync

---

## Error Handling

### Draft Creation Errors
- **Item not found**: Returns 404
- **Item not published**: Returns 400 (only published items can be edited via this flow)
- **Authentication required**: Returns 401
- **Database errors**: Returns 500 with error message

### Publishing Errors
- **Draft not found**: Returns 404
- **Update failed**: Returns 500 with error message
- **GitHub sync failed**: Returns 207 (multi-status) - item published but sync failed

---

## User Experience

### Visual Feedback
- ✅ Button shows "Creating Draft..." during creation
- ✅ Error messages displayed if creation fails
- ✅ Seamless redirect to edit page after creation
- ✅ Draft appears in Editorial Review Queue

### Workflow
- ✅ Simple: Click "Edit" → Edit → Submit for Review
- ✅ Transparent: User sees draft in review queue
- ✅ Collaborative: Multiple users can create drafts (first one wins)

---

## Benefits

1. **Accessibility**: Any authenticated user can suggest edits to published items
2. **Quality Control**: All edits go through editorial review
3. **No Duplicates**: System prevents duplicate published items
4. **Complete Updates**: All fields from draft are applied to published item
5. **GitHub Integration**: Changes synced to GitHub with proper attribution

---

## Future Enhancements

### Potential Improvements
1. **Version History**: Track which drafts were created from which published items
2. **Draft Comparison**: Show diff between draft and published item
3. **Draft Comments**: Allow users to add comments explaining changes
4. **Draft Notifications**: Notify original creator when draft is created
5. **Draft Expiration**: Auto-reject drafts after certain period

---

## Testing Checklist

- [x] Create draft from published KPI
- [x] Create draft from published Metric
- [x] Create draft from published Dimension
- [x] Create draft from published Event
- [x] Create draft from published Dashboard
- [x] Edit draft and save changes
- [x] Draft appears in Editorial Review Queue
- [x] Publish draft updates original published item
- [x] Reject draft removes it from queue
- [x] Error handling for unauthenticated users
- [x] Error handling for non-existent items
- [x] GitHub sync works correctly after publishing

---

## Status

✅ **COMPLETE** - Feature implemented and tested

**Files Changed:**
- `app/api/items/[kind]/[id]/create-draft/route.ts` (new)
- `components/EditPublishedButton.tsx` (new)
- `app/(content)/kpis/[slug]/page.tsx` (updated)
- `app/(content)/metrics/[slug]/page.tsx` (updated)
- `app/(content)/dimensions/[slug]/page.tsx` (updated)
- `app/(content)/events/[slug]/page.tsx` (updated)
- `app/(content)/dashboards/[slug]/page.tsx` (updated)
- `app/api/editor/publish/route.ts` (updated)

