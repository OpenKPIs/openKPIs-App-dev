# Save Operation Behavior and Data Safety

**Last Updated:** 2025-01-27

## Overview

This document explains how the save operation works in the edit flow, what happens if a user navigates away during save, and how data integrity is maintained.

---

## Save Operation Flow

### Current Implementation

When a user clicks "Save All" in the edit form:

1. **Client-Side:**
   - Form data is collected and normalized
   - `saving` state is set to `true`
   - Browser navigation warning is enabled
   - Fetch request is initiated with `keepalive: true`

2. **Server-Side:**
   - API route receives the request
   - Data is validated and normalized
   - Supabase database is updated
   - Response is sent back to client

3. **Client-Side (After Save):**
   - `saving` state is set to `false`
   - User is redirected to detail page
   - Navigation warning is disabled

---

## What Happens If User Navigates Away?

### Scenario 1: User Closes Browser Tab/Window

**Behavior:**
- Browser shows warning dialog: "Your changes are being saved. Are you sure you want to leave?"
- If user confirms:
  - Browser cancels the fetch request
  - **HOWEVER**, due to `keepalive: true` flag, the request may still complete on the server
  - Supabase update **may still succeed** if the request was already sent

**Data Safety:**
- ✅ **Supabase update will likely complete** (due to `keepalive` flag)
- ⚠️ User won't see confirmation (page is closed)
- ⚠️ Redirect won't happen (page is closed)

**Recommendation:** Wait for save to complete before closing the page.

### Scenario 2: User Navigates to Another Page (Internal Navigation)

**Behavior:**
- Browser warning is shown (via `beforeunload` event)
- If user confirms:
  - Fetch request is cancelled
  - Due to `keepalive: true`, request may still complete on server
  - User navigates to new page

**Data Safety:**
- ✅ **Supabase update will likely complete** (due to `keepalive` flag)
- ⚠️ User won't see confirmation (navigated away)
- ⚠️ Redirect won't happen (navigated away)

**Recommendation:** Wait for save to complete before navigating away.

### Scenario 3: User Clicks Browser Back Button

**Behavior:**
- Same as Scenario 2
- Browser warning is shown
- If user confirms, navigation proceeds

**Data Safety:**
- ✅ **Supabase update will likely complete** (due to `keepalive` flag)

---

## Technical Details

### Keepalive Flag

The `keepalive: true` flag in the fetch request:

```typescript
const response = await fetch(config.apiEndpoint(entityId), {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: dataToSave }),
  keepalive: true, // Allows request to complete even if page is closed
});
```

**What it does:**
- Allows the browser to continue the request even after the page is unloaded
- Request is sent in the background
- Server processes the request normally
- Response is discarded (page is gone)

**Limitations:**
- Only works for simple requests (PUT with JSON body is supported)
- Request size is limited (typically 64KB)
- Response is not received by client (page is closed)

### Beforeunload Handler

The `beforeunload` event handler:

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (savingRef.current) {
      e.preventDefault();
      e.returnValue = 'Your changes are being saved. Are you sure you want to leave?';
      return e.returnValue;
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, []);
```

**What it does:**
- Shows browser warning dialog when user tries to leave page
- Only active when `saving` is `true`
- Gives user chance to cancel navigation

**Limitations:**
- Cannot prevent navigation programmatically
- Can only show warning dialog
- User can still choose to leave

---

## Data Integrity Guarantees

### What IS Guaranteed

✅ **Supabase Update:**
- If the request reaches the server, Supabase update will complete
- Database transaction ensures atomicity
- Data is persisted even if user navigates away

✅ **Server-Side Processing:**
- API route processes request completely
- No partial updates (database transaction)
- Error handling ensures data consistency

### What IS NOT Guaranteed

❌ **Client-Side Confirmation:**
- User may not see success/error message
- Redirect may not happen
- User may not know if save succeeded

❌ **Request Cancellation:**
- If request is cancelled before reaching server, save won't happen
- If network fails, save won't happen
- User must wait for save to complete

---

## Best Practices

### For Users

1. **Wait for Save to Complete:**
   - Watch for "Saving…" button text
   - Wait for button to return to "Save All"
   - Don't navigate away while saving

2. **Check Save Status:**
   - If unsure, refresh the page
   - Check the detail page to verify changes
   - Look for `last_modified_at` timestamp

3. **Handle Errors:**
   - If error message appears, read it
   - Try saving again if needed
   - Contact support if issues persist

### For Developers

1. **Always Use Keepalive:**
   - Add `keepalive: true` to critical save requests
   - Ensures data persistence even if page closes

2. **Show Clear Feedback:**
   - Display saving state clearly
   - Warn users before navigation
   - Provide visual indicators

3. **Handle Aborted Requests:**
   - Don't show errors for aborted requests
   - Log aborted requests for debugging
   - Assume save may have completed

---

## Future Improvements

### Potential Enhancements

1. **Optimistic Updates:**
   - Update UI immediately
   - Sync with server in background
   - Rollback on error

2. **Save Queue:**
   - Queue saves if user navigates away
   - Retry failed saves
   - Show save status indicator

3. **Auto-Save:**
   - Save changes automatically
   - Reduce risk of data loss
   - Show last saved timestamp

4. **Better Navigation Blocking:**
   - Use Next.js router events
   - Block internal navigation during save
   - Show modal instead of browser dialog

---

## Summary

**Current Behavior:**
- ✅ Supabase update will likely complete even if user navigates away (due to `keepalive`)
- ⚠️ User may not see confirmation
- ⚠️ User should wait for save to complete

**Recommendation:**
- Wait for "Saving…" to change back to "Save All" before navigating away
- Check the detail page to verify changes were saved
- The save operation is designed to be resilient, but user patience is still recommended

---

*This document should be updated as save behavior is enhanced.*

