import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import TableOfContents from '@/components/TableOfContents';
import GiscusComments from '@/components/GiscusComments';
import CodeBlockToolbar from '@/components/CodeBlockToolbar';
import LikeButton from '@/components/LikeButton';
import AddToAnalysisButton from '@/components/AddToAnalysisButton';
import { STATUS } from '@/lib/supabase/auth';
import { withTablePrefix } from '@/src/types/entities';
import type { Database } from '@/lib/types/database';
import type { SupabaseClient } from '@supabase/supabase-js';

const kpisTable = withTablePrefix('kpis');

type KpiRow = Database['public']['Tables']['kpis']['Row'];
type NormalizedKpi = Omit<KpiRow, 'tags' | 'industry'> & {
  tags: string[];
  industry: string[];
};

type Heading = {
  id: string;
  text: string;
  level: number;
};

function toStringArray(value: string[] | string | null): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((entry): entry is string => typeof entry === 'string');
        }
      } catch {
        return [trimmed];
      }
    }
    return [trimmed];
  }
  return [];
}

function normalizeKpi(row: KpiRow): NormalizedKpi {
  return {
    ...row,
    tags: toStringArray(row.tags),
    industry: toStringArray(row.industry),
  };
}

async function fetchKpi(
  supabase: SupabaseClient<Database>,
  slug: string,
): Promise<NormalizedKpi | null> {
  const { data, error } = await supabase
    .from(kpisTable)
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return normalizeKpi(data);
}

function renderDetailRow(label: string, value: string | null | undefined) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ifm-color-emphasis-500)' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.95rem', color: 'var(--ifm-color-emphasis-800)' }}>{value}</span>
    </div>
  );
}

function renderTokenPills(label: string, items: string[]) {
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ifm-color-emphasis-500)' }}>
        {label}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {items.map((item) => (
          <span
            key={item}
            style={{
              backgroundColor: 'var(--ifm-color-emphasis-100)',
              color: 'var(--ifm-color-emphasis-800)',
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function renderRichTextBlock(id: string, title: string, content?: string | null) {
  if (!content) return null;
  return (
    <section id={id} style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h2>
      <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--ifm-color-emphasis-700)' }}>{content}</p>
    </section>
  );
}

function renderCodeBlock(id: string, title: string, code?: string | null, language?: string) {
  if (!code) return null;
  return (
    <section id={id} style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h2>
      <div style={{ position: 'relative', background: 'var(--ifm-color-emphasis-50)', borderRadius: '8px', overflow: 'hidden' }}>
        <pre
          id={id}
          style={{
            margin: 0,
            padding: '1.25rem',
            overflowX: 'auto',
            fontFamily: 'var(--ifm-font-family-monospace)',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            background: 'var(--ifm-color-emphasis-50)',
          }}
        >
          <code className={language ? `language-${language}` : undefined}>{code}</code>
        </pre>
        <CodeBlockToolbar code={code} language={language} blockId={id} />
      </div>
    </section>
  );
}

function buildHeadings(kpi: NormalizedKpi): Heading[] {
  const headings: Heading[] = [
    { id: 'overview', text: 'Overview', level: 2 },
  ];

  if (kpi.formula) headings.push({ id: 'formula', text: 'Formula', level: 2 });
  if (kpi.details) headings.push({ id: 'details', text: 'Details', level: 2 });
  if (kpi.ga4_implementation) headings.push({ id: 'ga4-implementation', text: 'GA4 Implementation', level: 2 });
  if (kpi.adobe_implementation) headings.push({ id: 'adobe-implementation', text: 'Adobe Implementation', level: 2 });
  if (kpi.amplitude_implementation) headings.push({ id: 'amplitude-implementation', text: 'Amplitude Implementation', level: 2 });
  if (kpi.data_layer_mapping) headings.push({ id: 'data-layer-mapping', text: 'Data Layer Mapping', level: 2 });
  if (kpi.xdm_mapping) headings.push({ id: 'xdm-mapping', text: 'XDM Mapping', level: 2 });
  if (kpi.sql_query) headings.push({ id: 'sql-query', text: 'SQL Query', level: 2 });
  if (kpi.calculation_notes) headings.push({ id: 'calculation-notes', text: 'Calculation Notes', level: 2 });

  return headings;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KPIDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const kpi = await fetchKpi(supabase, params.slug);

  if (!kpi) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>KPI Not Found</h1>
        <p>The KPI you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <Link href="/kpis" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to KPIs
        </Link>
      </main>
    );
  }

  const userName =
    (user?.user_metadata?.user_name as string | undefined) || user?.email || null;

  const canEdit = !!userName && (kpi.created_by === userName || kpi.status === STATUS.DRAFT);
  const headings = buildHeadings(kpi);

  const metadata = [
    renderDetailRow('Created by', kpi.created_by || 'Unknown'),
    renderDetailRow('Created on', kpi.created_at ? new Date(kpi.created_at).toLocaleDateString() : null),
    renderDetailRow('Last modified by', kpi.last_modified_by ?? undefined),
    renderDetailRow('Last modified on', kpi.last_modified_at ? new Date(kpi.last_modified_at).toLocaleDateString() : null),
    renderDetailRow('Status', kpi.status ? kpi.status.toUpperCase() : null),
    renderDetailRow('Priority', kpi.priority ?? undefined),
    renderDetailRow('Core area', kpi.core_area ?? undefined),
    renderDetailRow('Scope', kpi.scope ?? undefined),
    renderDetailRow('Type', kpi.kpi_type ?? undefined),
    renderDetailRow('Aggregation window', kpi.aggregation_window ?? undefined),
  ].filter(Boolean);

  return (
    <main style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem 1rem', overflowX: 'hidden' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 250px) minmax(0, 1fr) minmax(200px, 280px)',
          gap: '1.5rem',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <Sidebar section="kpis" />

        <article style={{ minWidth: 0, overflowWrap: 'break-word', wordWrap: 'break-word' }}>
          <div
            style={{
              marginBottom: '2rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--ifm-color-emphasis-200)',
            }}
          >
            <Link
              href="/kpis"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--ifm-color-primary)',
                textDecoration: 'none',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              ← Back to KPIs
            </Link>
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  {kpi.name}
                  {kpi.status === STATUS.DRAFT && (
                    <span
                      style={{
                        marginLeft: '0.75rem',
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#fbbf24',
                        color: '#78350f',
                        borderRadius: '4px',
                        fontWeight: 500,
                      }}
                    >
                      Draft
                    </span>
                  )}
                </h1>
                {kpi.description && (
                  <p style={{ fontSize: '1.125rem', color: 'var(--ifm-color-emphasis-600)', lineHeight: 1.6 }}>
                    {kpi.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LikeButton itemType="kpi" itemId={kpi.id} itemSlug={kpi.slug} />
                <AddToAnalysisButton
                  itemType="kpi"
                  itemId={kpi.id}
                  itemSlug={kpi.slug}
                  itemName={kpi.name}
                />
                {canEdit && (
                  <Link
                    href={`/kpis/${kpi.slug}/edit`}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--ifm-color-primary)',
                      color: '#fff',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>

          <section id="overview" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Overview</h2>
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                marginBottom: '1.5rem',
              }}
            >
              {metadata}
              {renderTokenPills('Tags', kpi.tags)}
              {renderTokenPills('Industries', kpi.industry)}
            </div>
          </section>

          {renderRichTextBlock('details', 'Business Details', kpi.details)}
          {renderRichTextBlock('calculation-notes', 'Calculation Notes', kpi.calculation_notes)}

          {renderCodeBlock('formula', 'Formula', kpi.formula, 'text')}
          {renderCodeBlock('sql-query', 'SQL Query', kpi.sql_query, 'sql')}
          {renderCodeBlock('ga4-implementation', 'GA4 Implementation', kpi.ga4_implementation, 'javascript')}
          {renderCodeBlock('adobe-implementation', 'Adobe Implementation', kpi.adobe_implementation, 'javascript')}
          {renderCodeBlock('amplitude-implementation', 'Amplitude Implementation', kpi.amplitude_implementation, 'javascript')}
          {renderCodeBlock('data-layer-mapping', 'Data Layer Mapping', kpi.data_layer_mapping, 'json')}
          {renderCodeBlock('xdm-mapping', 'XDM Mapping', kpi.xdm_mapping, 'json')}

          {kpi.github_pr_url && (
            <section id="github" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>GitHub</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href={kpi.github_pr_url} target="_blank" rel="noreferrer" style={{ color: 'var(--ifm-color-primary)' }}>
                  View related Pull Request
                </Link>
                {kpi.github_file_path && (
                  <code style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)' }}>{kpi.github_file_path}</code>
                )}
              </div>
            </section>
          )}

          <section id="discussion" style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Community Discussion</h2>
            <GiscusComments category="kpis" term={kpi.slug} />
          </section>
        </article>

        <TableOfContents headings={headings} />
      </div>
    </main>
  );
}

