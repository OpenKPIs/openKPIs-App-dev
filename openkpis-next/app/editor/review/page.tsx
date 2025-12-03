import { createClient, createAdminClient } from '@/lib/supabase/server';
import EditorReviewClient from './EditorReviewClient';
import type { DraftItem, DraftItemType } from './types';
import Link from 'next/link';
import { getUserRoleServer } from '@/lib/roles/server';
import { withTablePrefix } from '@/src/types/entities';
import type { Metadata } from 'next';

// Ensure this page runs dynamically per-request so auth cookies are available
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const role = await getUserRoleServer();
  if (role !== 'admin' && role !== 'editor') {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }
  return {};
}

interface TableConfig {
  key: DraftItemType;
  table: string;
}

const TABLES: TableConfig[] = [
  { key: 'kpi', table: 'kpis' },
  { key: 'metric', table: 'metrics' },
  { key: 'dimension', table: 'dimensions' },
  { key: 'event', table: 'events' },
  { key: 'dashboard', table: 'dashboards' },
];

type DraftRow = {
  id: string;
  name: string | null;
  slug: string | null;
  status: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  github_pr_number: number | null;
};

export default async function EditorReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Role check via shared helper; allow admin and editor access
  const role = await getUserRoleServer();
  const isAuthorized = role === 'admin' || role === 'editor';

  // Enhanced debugging for role resolution
  if (!isAuthorized) {
    // Try direct profile query for debugging
    const tableName = withTablePrefix('user_profiles');
    const { data: debugProfile, error: debugError } = await supabase
      .from(tableName)
      .select('id, user_role, role, is_admin, is_editor')
      .eq('id', user?.id || '')
      .maybeSingle();

    console.error('[EditorReviewPage] Authorization failed:', {
      userId: user?.id,
      resolvedRole: role,
      authError: authError?.message,
      profileExists: !!debugProfile,
      profileUserRole: debugProfile?.user_role,
      profileIsAdmin: debugProfile?.is_admin,
      profileIsEditor: debugProfile?.is_editor,
      profileError: debugError?.message,
      tableName,
    });
  }

  if (authError || !user || !isAuthorized) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          You are not authorized to access this page
        </h1>
        <p style={{ marginBottom: '1rem', color: 'var(--ifm-color-emphasis-700)' }}>
          This section is restricted to administrators and editors.
        </p>
        <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)' }}>
          Resolved role: {role || 'unknown'} | User ID: {user?.id || 'none'}
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--ifm-color-primary)',
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Explore KPIs
        </Link>
      </main>
    );
  }

  const admin = createAdminClient();

  const draftPromises = TABLES.map(async (config) => {
    const tableName = withTablePrefix(config.table);
    const { data, error } = await admin
      .from(tableName)
      .select('id, name, slug, status, created_by, created_at, updated_at:last_modified_at, github_pr_number')
      .eq('status', 'draft')
      .order('last_modified_at', { ascending: false })
      .limit(100);

    if (error || !data) {
      return [] as DraftItem[];
    }

    return data.map((item: DraftRow) => ({
      ...item,
      type: config.key,
    })) as DraftItem[];
  });

  const draftsByType = await Promise.all(draftPromises);
  const drafts = draftsByType.flat();

  drafts.sort((a, b) => {
    const aDate = new Date(a.updated_at || a.created_at || 0).getTime();
    const bDate = new Date(b.updated_at || b.created_at || 0).getTime();
    return bDate - aDate;
  });

  const editorName =
    (user?.user_metadata?.user_name as string | undefined) ||
    user?.email ||
    user?.id ||
    'Guest';

  return (
    <EditorReviewClient
      editorName={editorName}
      initialItems={drafts}
    />
  );
}
