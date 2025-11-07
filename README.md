# OpenKPIs Next.js Development

Development workspace for OpenKPIs Next.js migration.

## Structure

```
openkpis-next/
├── credentials/          # All .env files with tokens/keys (NOT in GitHub)
│   ├── .env.local       # Your actual credentials (create this)
│   ├── .env.template    # Template (safe to commit)
│   └── README.md        # Credentials guide
│
├── internal_docs/       # Internal planning docs (NOT in GitHub)
│   ├── planning/        # Development planning
│   └── architecture/    # Architecture docs
│
└── openkpis-next/       # GitHub-ready repository
    ├── apps/           # Next.js application
    ├── packages/       # Shared packages
    └── content/        # YAML content
```

## Getting Started

### 1. Set Up Credentials

```powershell
cd credentials
Copy-Item .env.template .env.local
# Edit .env.local with your actual credentials
```

⚠️ **Important:** Never commit `.env.local` - it's gitignored.

### 2. Review Planning Docs

See `internal_docs/planning/` for:
- Final Development Prompt
- Complete Requirements
- Database Schema

### 3. Start Development

Work in `openkpis-next/` folder - this is the GitHub-ready repository.

## Key Files

- **STRUCTURE.md** - Project structure overview
- **credentials/README.md** - Credentials management guide
- **internal_docs/INDEX.md** - Internal documentation index
- **openkpis-next/README.md** - Public repository README

## Security

✅ **Safe:**
- `credentials/.env.template` (template only)
- `internal_docs/` (not committed)

❌ **NOT Committed:**
- `credentials/.env.local` (your actual credentials)
- `internal_docs/` (internal planning)

## Development

All development work happens in `openkpis-next/`. Internal docs in `internal_docs/` are for planning only.
