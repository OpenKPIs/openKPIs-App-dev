# OpenKPIs Next.js Project Structure

## Folder Organization

```
openkpis-next/
├── credentials/                # All .env files with tokens/keys (NOT in GitHub)
│   ├── .env.local             # Local development credentials
│   ├── .env.template          # Template (safe to commit)
│   └── README.md              # Credentials guide
│
├── internal_docs/              # Internal planning docs (NOT in GitHub)
│   ├── planning/               # Development planning
│   ├── notes/                  # Meeting notes, decisions
│   ├── architecture/           # Architecture diagrams
│   └── database/               # Database planning
│
└── openkpis-next/              # GitHub-ready repository
    ├── apps/
    │   └── web/                # Next.js application
    ├── packages/
    │   └── schemas/            # Shared TypeScript schemas
    ├── content/                # YAML content (source of truth)
    │   ├── kpis/
    │   ├── events/
    │   ├── dimensions/
    │   └── metrics/
    ├── .gitignore
    ├── package.json
    └── README.md
```

## Purpose

### `internal_docs/`
- **NOT committed** to GitHub
- Contains planning, notes, internal decisions
- Safe for secrets, work-in-progress docs
- Development-focused documentation

### `openkpis-next/`
- **GitHub-ready** repository
- Contains only production code and public docs
- Follows open-source best practices
- Ready to be pushed to GitHub

## Development Workflow

1. **Planning:** Create docs in `internal_docs/`
2. **Development:** Work in `openkpis-next/`
3. **Commits:** Only commit `openkpis-next/` changes
4. **Documentation:** Move final docs from `internal_docs/` to `openkpis-next/` when ready

## Migration Strategy

- Start with `openkpis-next/` as the new Next.js app
- Keep `internal_docs/` for planning the migration
- Gradually move completed features to `openkpis-next/`
- Eventually `openkpis-next/` becomes the full project

