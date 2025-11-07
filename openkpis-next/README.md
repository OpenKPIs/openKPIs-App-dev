# OpenKPIs - Next.js

Open-source, community-driven analytics KPIs, Metrics, Dimensions, and Events repository.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

**For Local Development:**
```bash
# Link to credentials folder
cd ..
# Copy credentials from credentials/.env.local
# Load variables from ../credentials/.env.local
```

**Option A: Use dotenv-cli**
```bash
npm install -g dotenv-cli
dotenv -e ../credentials/.env.local -- npm run dev
```

**Option B: Create symlink (Windows)**
```powershell
cd openkpis-next
New-Item -ItemType SymbolicLink -Path ".env.local" -Target "../credentials/.env.local"
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
openkpis-next/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── (content)/         # Content pages (KPIs, Events, etc.)
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── lib/
│   ├── supabase/          # Supabase clients
│   ├── services/          # External services
│   └── types/             # TypeScript types
├── components/            # React components
└── package.json
```

---

## Environment Variables

See `../credentials/README.md` for complete environment setup.

**Required for development:**
- Supabase DEV credentials
- GitHub credentials (for content sync)
- OpenAI API key (if using AI features)

---

## Development Workflow

1. **Local Development:** Work in this folder
2. **Test Locally:** `npm run dev`
3. **Push to GitHub:** Push `main` branch
4. **Auto-Deploy:** Vercel deploys from `main`

---

## Next Steps

See `../internal_docs/planning/FINAL_DEVELOPMENT_PROMPT.md` for complete development plan.

**Phase 1 Tasks:**
- [x] Initialize Next.js project
- [ ] Set up Supabase client
- [ ] Create database schema
- [ ] Set up authentication
- [ ] Create base pages

---

## Resources

- **Planning Docs:** `../internal_docs/planning/`
- **Credentials:** `../credentials/`
- **Development Prompt:** `../internal_docs/planning/FINAL_DEVELOPMENT_PROMPT.md`
