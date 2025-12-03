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
  let supabase;
  let user;
  let role: 'admin' | 'editor' | 'contributor';
  let admin;

  try {
    supabase = await createClient();
  } catch {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Configuration Error
        </h1>
        <p style={{ marginBottom: '1rem', color: 'var(--ifm-color-emphasis-700)' }}>
          Server configuration error. Please contact support.
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

  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();
    user = authUser;

    if (authError || !user) {
      return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            Authentication Required
          </h1>
          <p style={{ marginBottom: '1rem', color: 'var(--ifm-color-emphasis-700)' }}>
            Please sign in to access this page.
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

    // Role check via shared helper; allow admin and editor access
    role = await getUserRoleServer();
  } catch {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Error Loading Page
        </h1>
        <p style={{ marginBottom: '1rem', color: 'var(--ifm-color-emphasis-700)' }}>
          There was an error loading this page. Please try again later.
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

  const isAuthorized = role === 'admin' || role === 'editor';

  if (!isAuthorized) {
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

  try {
    admin = createAdminClient();
  } catch {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Configuration Error
        </h1>
        <p style={{ marginBottom: '1rem', color: 'var(--ifm-color-emphasis-700)' }}>
          Admin client configuration error. Please contact support.
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

  try {
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
  } catch {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Error Loading Drafts
        </h1>
        <p style={{ marginBottom: '1rem', color: 'var(--ifm-color-emphasis-700)' }}>
          There was an error loading draft items. Please try again later.
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
}
