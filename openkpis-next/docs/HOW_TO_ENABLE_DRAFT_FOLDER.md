# How to Enable Draft Folder Approach

## Quick Start

**Add environment variable to Vercel:**
```env
GITHUB_USE_DRAFT_FOLDER=true
```

**That's it!** The system will now:
- ✅ Commit directly to `main` branch
- ✅ Use `data-layer-draft/` folder for new items
- ✅ Skip branch creation and PR creation
- ✅ Commits count immediately (if on main branch)

---

## What Changes

### Before (Current Approach):
```
Create KPI
  ↓
Create branch: created-kpis-my-kpi-1234567890
  ↓
Commit to branch
  ↓
Create PR
  ↓
Merge PR → Counts
```

### After (Draft Folder):
```
Create KPI
  ↓
Commit directly to main: data-layer-draft/kpis/my-kpi.yml
  ↓
✅ Counts immediately!
```

---

## Testing

1. **Set environment variable:**
   - Vercel → Settings → Environment Variables
   - Add: `GITHUB_USE_DRAFT_FOLDER=true`
   - Redeploy

2. **Create a KPI:**
   - Should commit to `data-layer-draft/kpis/{slug}.yml`
   - Should commit to `main` branch
   - Check GitHub: commit should be on main

3. **Check contributions:**
   - If App commits count → should see contribution
   - If App commits don't count → won't see contribution (known issue)

---

## Next Steps

After testing with App, we can add user token support:
- Try user token first (if user is collaborator)
- Fallback to App if user token fails
- This will ensure contributions count

---

## Summary

**To enable:** Set `GITHUB_USE_DRAFT_FOLDER=true` in Vercel  
**Result:** Commits directly to main in draft folder  
**Benefits:** Simpler workflow, commits on main (might count)  
**Next:** Add user token support for guaranteed contributions

