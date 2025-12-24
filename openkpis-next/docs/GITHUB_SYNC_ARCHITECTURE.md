# GitHub Sync Architecture - Single Component with Separate Flows

**Date:** 2025-01-27  
**Question:** Are all three approaches in a single component or different flows?

---

## ✅ **Answer: Single Entry Point, Separate Implementation Functions**

The architecture uses:
- **1 Single Exported Function** (`syncToGitHub`) - Acts as the router/orchestrator
- **3 Separate Implementation Functions** - One for each approach
- **1 Helper Function** - Permission checking

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  syncToGitHub() - SINGLE ENTRY POINT                     │
│  (Exported function - called by API routes)              │
│                                                           │
│  1. Check write access                                   │
│  2. Route to appropriate implementation                  │
└─────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ syncViaDirect│ │syncViaForkAnd│ │commitWithUser│
│   Commit()    │ │     PR()     │ │   Token()    │
│              │ │              │ │              │
│ Approach 1   │ │ Approach 2   │ │ Approach 3   │
│ (Owners)     │ │ (Fork+PR)    │ │ (Bot-based)  │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Function Structure

### **1. Single Entry Point (Router)**

**Function:** `syncToGitHub()` - **EXPORTED**

**Location:** `lib/services/github.ts` (line ~1369)

**Responsibilities:**
- ✅ Permission checking (write access detection)
- ✅ Routing logic (which approach to use)
- ✅ User preference detection
- ✅ Error handling and fallbacks
- ✅ Returns consistent response format

**Called by:**
- API routes (`/api/items/[kind]/[id]/sync-github/route.ts`)
- Editor publish flow
- AI submission flow

### **2. Separate Implementation Functions**

#### **Approach 1: Direct Commit**
**Function:** `syncViaDirectCommit()` - **PRIVATE**

**Location:** `lib/services/github.ts` (line ~643)

**Flow:**
1. Get main branch SHA
2. Create branch in org repo
3. Commit file to branch
4. Create PR from branch to main

**Used when:** User has write access (collaborator/org member)

---

#### **Approach 2: Fork + PR**
**Function:** `syncViaForkAndPR()` - **PRIVATE**

**Location:** `lib/services/github.ts` (line ~850)

**Flow:**
1. Ensure fork exists
2. Get main branch SHA
3. Create branch in fork
4. Commit file to fork
5. Verify branch exists
6. Create PR from fork to org repo

**Used when:** User doesn't have write access + fork preference enabled

---

#### **Approach 3: Bot-Based**
**Function:** `commitWithUserToken()` - **PRIVATE**

**Location:** `lib/services/github.ts` (line ~266)

**Flow:**
1. Get main branch SHA (App token)
2. Create branch in org repo (App token)
3. Commit file to branch (App token with user attribution)
4. Create PR from branch to main (App token)

**Used when:** User doesn't have write access + fork preference disabled

---

### **3. Helper Function**

**Function:** `checkUserWriteAccess()` - **PRIVATE**

**Location:** `lib/services/github.ts` (line ~584)

**Responsibilities:**
- Check if user is collaborator
- Check if user is org member
- Return boolean (has write access or not)

---

## Routing Logic

```typescript
export async function syncToGitHub(params) {
  // 1. Check write access first
  if (hasWriteAccess) {
    return await syncViaDirectCommit(); // Approach 1
  }
  
  // 2. Check user preference
  if (mode === 'fork_pr') {
    return await syncViaForkAndPR(); // Approach 2
  } else {
    return await commitWithUserToken(); // Approach 3
  }
}
```

---

## Benefits of This Architecture

### ✅ **Single Interface**
- One function to call from API routes
- Consistent response format
- Easy to use

### ✅ **Separation of Concerns**
- Each approach has its own function
- Clear responsibilities
- Easy to maintain

### ✅ **Modularity**
- Can modify one approach without affecting others
- Easy to test each approach independently
- Can add new approaches easily

### ✅ **Maintainability**
- Clear code organization
- Easy to understand flow
- Easy to debug

---

## Code Organization

### **File Structure**

```
lib/services/github.ts
├── Constants & Types
├── Helper Functions
│   ├── getUserOAuthTokenWithRefresh()
│   ├── refreshGitHubTokenSilently()
│   └── checkUserWriteAccess() ← Helper
├── Implementation Functions
│   ├── commitWithUserToken() ← Approach 3
│   ├── syncViaDirectCommit() ← Approach 1
│   └── syncViaForkAndPR() ← Approach 2
└── Router Function
    └── syncToGitHub() ← Single Entry Point (EXPORTED)
```

---

## Summary

### **Single Component?**
✅ **Yes** - One exported function (`syncToGitHub`) acts as the single entry point

### **Different Flows?**
✅ **Yes** - Three separate implementation functions, each handling a different approach

### **Architecture Pattern**
✅ **Router Pattern** - Single interface, multiple implementations

---

## Advantages

1. **✅ Single Point of Entry** - API routes only call one function
2. **✅ Clean Separation** - Each approach is self-contained
3. **✅ Easy to Extend** - Add new approaches by adding new functions
4. **✅ Easy to Test** - Test each approach independently
5. **✅ Easy to Maintain** - Clear code organization

---

## Example Usage

```typescript
// API Route
import { syncToGitHub } from '@/lib/services/github';

// Single function call - routing happens internally
const result = await syncToGitHub({
  tableName: 'kpis',
  record: kpiData,
  action: 'created',
  userLogin: 'username',
  userId: 'user-id',
  // ... other params
});

// Result includes mode to indicate which approach was used
console.log(result.mode); // 'direct_commit' | 'fork_pr' | 'internal_app'
```

---

**Conclusion:** The architecture uses a **single entry point** with **separate implementation functions** for each approach. This provides the best of both worlds: simplicity for callers and maintainability for the codebase.

