# Copy Database Schema from DEV to PROD

## Overview

This guide will help you copy all tables, indexes, RLS policies, and other database objects from your DEV Supabase project to your PROD Supabase project.

---

## Method 1: Export Schema from DEV and Import to PROD (Recommended)

### Step 1: Export Schema from DEV Project

1. **Go to Supabase Dashboard → DEV Project**
   - URL: `https://supabase.com/dashboard/project/[your-dev-project-id]`

2. **Navigate to SQL Editor**
   - Click on **SQL Editor** in the left sidebar

3. **Generate Schema SQL**
   - Click **"New Query"**
   - Run this query to generate the complete schema:

```sql
-- Generate CREATE TABLE statements for all tables
SELECT 
    'CREATE TABLE ' || schemaname || '.' || tablename || ' (' || 
    string_agg(
        column_name || ' ' || 
        CASE 
            WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
            WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
            WHEN data_type = 'numeric' THEN 'NUMERIC(' || numeric_precision || ',' || numeric_scale || ')'
            WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
            WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
            WHEN data_type = 'time without time zone' THEN 'TIME'
            WHEN data_type = 'time with time zone' THEN 'TIMETZ'
            WHEN data_type = 'double precision' THEN 'DOUBLE PRECISION'
            WHEN data_type = 'real' THEN 'REAL'
            WHEN data_type = 'integer' THEN 'INTEGER'
            WHEN data_type = 'bigint' THEN 'BIGINT'
            WHEN data_type = 'smallint' THEN 'SMALLINT'
            WHEN data_type = 'boolean' THEN 'BOOLEAN'
            WHEN data_type = 'text' THEN 'TEXT'
            WHEN data_type = 'jsonb' THEN 'JSONB'
            WHEN data_type = 'json' THEN 'JSON'
            WHEN data_type = 'uuid' THEN 'UUID'
            WHEN data_type = 'date' THEN 'DATE'
            WHEN data_type = 'bytea' THEN 'BYTEA'
            ELSE UPPER(data_type)
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        ', '
    ) || ');' AS create_table_sql
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT IN ('schema_migrations')
GROUP BY schemaname, tablename
ORDER BY tablename;
```

4. **Better Method: Use pg_dump (if you have access)**
   - Or use Supabase CLI (see Method 2 below)

---

## Method 2: Use Supabase CLI (Best Method)

### Step 1: Install Supabase CLI

```bash
# Windows (using Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or using npm
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link DEV Project and Pull Schema

```bash
# Navigate to your project directory
cd openkpis-next

# Link to DEV project
supabase link --project-ref [your-dev-project-ref]

# Pull schema from DEV
supabase db pull

# This creates/updates migration files in supabase/migrations/
```

### Step 4: Link to PROD Project and Push Schema

```bash
# Unlink from DEV
supabase unlink

# Link to PROD project
supabase link --project-ref [your-prod-project-ref]

# Push schema to PROD
supabase db push
```

---

## Method 3: Manual Copy via Supabase Dashboard (Simplest)

### Step 1: Get Complete Schema from DEV

1. **Go to DEV Project → SQL Editor**
2. **Click "New Query"**
3. **Run this comprehensive schema export:**

```sql
-- Export all table definitions, indexes, and constraints
SELECT 
    '-- Table: ' || schemaname || '.' || tablename || E'\n' ||
    pg_get_tabledef(schemaname||'.'||tablename) || E';\n\n' AS table_definition
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT LIKE 'pg_%'
ORDER BY tablename;
```

**OR use this simpler approach:**

1. **Go to DEV Project → Database → Tables**
2. **For each table:**
   - Click on the table
   - Click "View Definition" or "SQL"
   - Copy the CREATE TABLE statement

### Step 2: Copy Tables to PROD

1. **Go to PROD Project → SQL Editor**
2. **Paste and run each CREATE TABLE statement**
3. **Run CREATE INDEX statements**
4. **Run CREATE POLICY statements (RLS)**

---

## Method 4: Use Complete Database Schema File (If Available)

If you have a complete schema file (like `COMPLETE_DATABASE_SCHEMA.sql`):

1. **Open the schema file**
2. **Go to PROD Project → SQL Editor**
3. **Copy and paste the entire schema**
4. **Run it**

---

## Recommended: Step-by-Step Manual Copy (Safest)

### Step 1: List All Tables in DEV

1. Go to **DEV Project → SQL Editor**
2. Run this query:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Step 2: Export Each Table Definition

For each table, run this query in DEV:

```sql
-- Replace 'table_name' with actual table name
SELECT 
    'CREATE TABLE ' || table_name || ' (\n' ||
    string_agg(
        '  ' || column_name || ' ' || 
        CASE 
            WHEN data_type = 'character varying' THEN 'VARCHAR(' || COALESCE(character_maximum_length::text, '') || ')'
            WHEN data_type = 'character' THEN 'CHAR(' || character_maximum_length || ')'
            WHEN data_type = 'numeric' THEN 'NUMERIC(' || numeric_precision || ',' || numeric_scale || ')'
            WHEN data_type = 'timestamp without time zone' THEN 'TIMESTAMP'
            WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMPTZ'
            WHEN data_type = 'uuid' THEN 'UUID'
            WHEN data_type = 'jsonb' THEN 'JSONB'
            WHEN data_type = 'text' THEN 'TEXT'
            WHEN data_type = 'integer' THEN 'INTEGER'
            WHEN data_type = 'bigint' THEN 'BIGINT'
            WHEN data_type = 'boolean' THEN 'BOOLEAN'
            WHEN data_type = 'double precision' THEN 'DOUBLE PRECISION'
            ELSE UPPER(data_type)
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE 
            WHEN column_default IS NOT NULL AND column_default LIKE 'nextval%' THEN ' DEFAULT ' || column_default
            WHEN column_default IS NOT NULL AND column_default NOT LIKE 'nextval%' THEN ' DEFAULT ' || column_default
            ELSE ''
        END,
        E',\n'
        ORDER BY ordinal_position
    ) || E'\n);' AS create_statement
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'kpis'  -- Change this for each table
GROUP BY table_name;
```

### Step 3: Export Indexes

```sql
SELECT 
    indexname || ' ON ' || tablename || ' (' || 
    string_agg(attname, ', ' ORDER BY array_position((SELECT array_agg(attnum) FROM pg_index WHERE indexrelid = i.indexrelid), a.attnum)) || 
    ');' AS index_definition
FROM pg_indexes i
JOIN pg_class c ON c.relname = i.indexname
JOIN pg_index idx ON idx.indexrelid = c.oid
JOIN pg_attribute a ON a.attrelid = idx.indrelid AND a.attnum = ANY(idx.indkey)
WHERE schemaname = 'public'
GROUP BY indexname, tablename;
```

### Step 4: Export RLS Policies

```sql
SELECT 
    'CREATE POLICY "' || policyname || '" ON ' || tablename || 
    ' FOR ' || cmd || 
    ' USING (' || qual || ')' ||
    CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END || 
    ';' AS policy_definition
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Step 5: Run in PROD

1. Go to **PROD Project → SQL Editor**
2. Run each CREATE TABLE statement
3. Run each CREATE INDEX statement
4. Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
5. Run each CREATE POLICY statement

---

## Quick Copy Script (Run in DEV, then PROD)

### In DEV Project SQL Editor:

```sql
-- 1. Get all table creation statements
SELECT 
    'CREATE TABLE IF NOT EXISTS ' || table_name || ' AS SELECT * FROM ' || table_name || ' LIMIT 0;' AS create_empty_table
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
```

**Note:** This creates empty tables. You'll still need to:
- Add constraints
- Add indexes
- Add RLS policies
- Add default values

---

## Recommended Approach: Use pgAdmin or DBeaver

1. **Connect to DEV database** (get connection string from Supabase)
2. **Right-click database → Backup**
3. **Select "Schema Only"** (not data)
4. **Save backup file**
5. **Connect to PROD database**
6. **Right-click database → Restore**
7. **Select the backup file**

---

## Step-by-Step: Copy Schema Using Supabase Dashboard (Easiest)

### Step 1: Get Table Definitions from DEV

1. Go to **DEV Project → Database → Tables**
2. For each table:
   - Click on the table name
   - Click **"View Definition"** or look for **SQL** tab
   - Copy the CREATE TABLE statement

### Step 2: Create Tables in PROD

1. Go to **PROD Project → SQL Editor**
2. Paste and run each CREATE TABLE statement
3. Verify tables are created: **Database → Tables**

### Step 3: Copy Indexes

1. In DEV, for each table, go to **Database → Tables → [table] → Indexes**
2. Copy CREATE INDEX statements
3. Run in PROD SQL Editor

### Step 4: Enable RLS and Copy Policies

1. In DEV, go to **Authentication → Policies**
2. For each table:
   - Copy all RLS policies
   - In PROD, enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
   - Create each policy

### Step 5: Run Migrations

1. Don't forget to run the new migration:
   ```sql
   -- Run in PROD SQL Editor
   -- Copy contents of: supabase-migrations/create_user_insights_and_analyses.sql
   ```

---

## Verify Schema Copy

After copying, verify in PROD:

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Count tables
SELECT COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Compare with DEV (should match)
```

---

## Important Notes

⚠️ **Do NOT copy data** - Only copy schema (table structures, indexes, policies)

⚠️ **Verify RLS policies** - Make sure all RLS policies are copied correctly

⚠️ **Check foreign keys** - Ensure all foreign key constraints are included

⚠️ **Test thoroughly** - After copying, test all features in PROD

---

## Next Steps After Schema Copy

1. ✅ Verify all tables exist
2. ✅ Verify all indexes exist
3. ✅ Verify RLS policies are enabled
4. ✅ Run `create_user_insights_and_analyses.sql` migration
5. ✅ Test authentication
6. ✅ Test KPI creation
7. ✅ Test AI Analyst flow

---

## Troubleshooting

**Error: Table already exists**
- Use `CREATE TABLE IF NOT EXISTS` or drop existing tables first

**Error: Foreign key constraint fails**
- Create tables in dependency order (referenced tables first)

**Error: Permission denied**
- Check that you're using the service role key or have proper permissions

**Missing indexes**
- Verify all indexes are copied
- Check query performance

---

## Recommended Tools

1. **Supabase CLI** - Best for automated migrations
2. **pgAdmin** - Good for visual schema export/import
3. **DBeaver** - Free database tool with export/import
4. **Supabase Dashboard SQL Editor** - Simple manual copy

