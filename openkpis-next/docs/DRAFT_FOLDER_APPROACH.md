# Draft Folder Approach - Direct to Main Branch

## Proposed Workflow

**Direct to Main with Draft Folder:**
1. All KPIs commit **directly to main branch**
2. But commit to **draft folder**: `data-layer-draft/kpis/{slug}.yml`
3. After review, API moves file from `data-layer-draft/` → `data-layer/`
4. This move is also a commit (on main branch)

**Benefits:**
- ✅ Commits directly to main → **count immediately** (no PR merge needed)
- ✅ User commits (if user has write access) → **definitely counts**
- ✅ Draft items separated from published items
- ✅ Review process is just moving files (simple)
- ✅ No branches, no PRs needed

---

## Implementation

### Step 1: Commit to Draft Folder

**When user creates KPI:**
```typescript
// Commit directly to main, but in draft folder
const filePath = `data-layer-draft/${params.tableName}/${fileName}`;

// Try user token first (if user can commit to main)
const userOctokit = new Octokit({ auth: userToken });

await userOctokit.repos.createOrUpdateFileContents({
  owner: GITHUB_OWNER,
  repo: GITHUB_CONTENT_REPO,
  path: filePath,
  message: `Add draft ${params.tableName.slice(0, -1)}: ${params.record.name}`,
  content: Buffer.from(yamlContent).toString('base64'),
  branch: 'main',  // Direct to main!
  author: {
    name: authorName,
    email: authorEmail,
  },
  committer: {
    name: authorName,
    email: authorEmail,
  },
});
```

**Result:**
- ✅ Commit is on main branch → **counts immediately**
- ✅ File is in draft folder → separated from published
- ✅ User made the commit → **definitely counts**

### Step 2: Review and Publish API

**New API endpoint:** `/api/items/[id]/publish`

**Moves file from draft to published:**
```typescript
// Read file from draft folder
const draftPath = `data-layer-draft/kpis/my-kpi.yml`;
const { data: draftFile } = await octokit.repos.getContent({
  owner: GITHUB_OWNER,
  repo: GITHUB_CONTENT_REPO,
  path: draftPath,
  ref: 'main',
});

// Write to published folder
const publishedPath = `data-layer/kpis/my-kpi.yml`;
await octokit.repos.createOrUpdateFileContents({
  owner: GITHUB_OWNER,
  repo: GITHUB_CONTENT_REPO,
  path: publishedPath,
  message: `Publish ${tableName.slice(0, -1)}: ${record.name}`,
  content: draftFile.content,  // Same content
  branch: 'main',
  author: {
    name: authorName,
    email: authorEmail,
  },
  committer: {
    name: authorName,
    email: authorEmail,
  },
});

// Delete from draft folder
await octokit.repos.deleteFile({
  owner: GITHUB_OWNER,
  repo: GITHUB_CONTENT_REPO,
  path: draftPath,
  message: `Remove draft ${tableName.slice(0, -1)}: ${record.name}`,
  branch: 'main',
  sha: draftFile.sha,
});
```

**Result:**
- ✅ File moved from draft → published
- ✅ Another commit on main → **counts as contribution**
- ✅ Draft file removed

---

## Why This Works Better

### 1. Commits to Main Count Immediately

**GitHub Contribution Rules:**
- ✅ Commits to main branch count **immediately**
- ✅ No need to merge PR
- ✅ No waiting for merge

**Current Approach:**
- ❌ Commits on feature branch → only count after PR merge
- ❌ App commits might not count

**Draft Folder Approach:**
- ✅ Commits directly to main → **count immediately**
- ✅ User commits → **definitely count**

### 2. User Commits Count

**If user can commit to main:**
- ✅ Use user token → commits count
- ✅ No App needed for commits
- ✅ Simple and direct

**If user can't commit to main (org repo):**
- ⚠️ Still need App for commits
- ⚠️ But commits are on main (might count differently)
- ⚠️ Or make user a collaborator (one-time setup)

### 3. Simple Review Process

**Current:**
- Review PR → Merge PR → Counts

**Draft Folder:**
- Review draft → Click "Publish" → Move file → Counts

**Benefits:**
- ✅ Simpler workflow
- ✅ No PRs needed
- ✅ Direct control

---

## File Structure

**Draft Items:**
```
data-layer-draft/
  ├── kpis/
  │   ├── my-kpi-1.yml
  │   └── my-kpi-2.yml
  ├── metrics/
  │   └── my-metric.yml
  └── ...
```

**Published Items:**
```
data-layer/
  ├── kpis/
  │   ├── published-kpi-1.yml
  │   └── published-kpi-2.yml
  ├── metrics/
  │   └── published-metric.yml
  └── ...
```

---

## API Endpoints Needed

### 1. Create Item (Existing - Modified)

**Current:** Creates branch → PR  
**New:** Commits directly to main in draft folder

```typescript
POST /api/items/create
// Commits to: data-layer-draft/{type}/{slug}.yml
// Branch: main
// Returns: commit SHA, file path
```

### 2. Publish Item (New)

**Moves file from draft to published:**

```typescript
POST /api/items/[id]/publish
// 1. Read from: data-layer-draft/{type}/{slug}.yml
// 2. Write to: data-layer/{type}/{slug}.yml
// 3. Delete from: data-layer-draft/{type}/{slug}.yml
// 4. Update status in DB: draft → published
```

### 3. List Draft Items (New)

**List all items in draft folder:**

```typescript
GET /api/items/drafts
// Reads all files from data-layer-draft/
// Returns: list of draft items
```

---

## Code Changes

### 1. Modify Create Item API

**Change file path:**
```typescript
// Current
const filePath = `data-layer/${params.tableName}/${fileName}`;

// New
const filePath = `data-layer-draft/${params.tableName}/${fileName}`;
```

**Change branch:**
```typescript
// Current
const branchName = `${params.action}-${params.tableName}-${branchIdentifier}-${Date.now()}`;

// New
const branchName = 'main';  // Direct to main!
```

**Remove PR creation:**
```typescript
// Current: Creates PR
// New: No PR needed, commit is already on main
```

### 2. Add Publish API

**New file:** `app/api/items/[id]/publish/route.ts`

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Get item from DB
  // 2. Read file from data-layer-draft/
  // 3. Write to data-layer/
  // 4. Delete from data-layer-draft/
  // 5. Update DB status
}
```

### 3. Update File Reading Logic

**When reading items, check both folders:**
```typescript
// Check published first
let filePath = `data-layer/${tableName}/${slug}.yml`;
try {
  const file = await octokit.repos.getContent({ path: filePath });
  return file;
} catch {
  // Not published, check draft
  filePath = `data-layer-draft/${tableName}/${slug}.yml`;
  const file = await octokit.repos.getContent({ path: filePath });
  return file;
}
```

---

## Benefits vs Current Approach

| Feature | Current (Branch/PR) | Draft Folder |
|---------|---------------------|--------------|
| **Commits Count** | ❌ Only after merge | ✅ Immediately |
| **User Commits** | ❌ App commits | ✅ User commits (if access) |
| **Workflow** | Complex (branch/PR) | Simple (direct commit) |
| **Review Process** | PR review | Draft review → Publish |
| **Branches** | Many branches | No branches |
| **PRs** | One per KPI | None |

---

## Potential Issues

### 1. User Access to Main

**If user can't commit to main in org repo:**
- Need to make user a collaborator (one-time)
- Or use App (but commits on main might count differently)

### 2. Conflict Handling

**Multiple users committing to main:**
- Each KPI has unique file path → no conflicts
- Sequential commits (GitHub handles this)

### 3. Webhook Updates

**Current webhook listens for PR events:**
- Need to update to listen for commit events
- Or remove webhook (not needed if commits are direct)

---

## Testing Plan

1. **Test user commit to main:**
   - Try committing with user token to main
   - Verify commit shows as user (not App)
   - Check if contribution counts immediately

2. **Test draft folder:**
   - Create KPI → check draft folder
   - Publish KPI → check published folder
   - Verify draft file removed

3. **Test contribution counting:**
   - Create KPI → check profile immediately
   - Publish KPI → check profile again
   - Both should count

---

## Summary

**Draft folder approach is BETTER because:**
- ✅ Commits directly to main → **count immediately**
- ✅ User commits → **definitely count**
- ✅ Simpler workflow (no branches/PRs)
- ✅ Clear separation (draft vs published)
- ✅ Review process is just moving files

**This could solve the contribution issue completely!**

