import React from 'react';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import TableOfContents from '@/components/TableOfContents';
import GiscusComments from '@/components/GiscusComments';
import CodeBlockToolbar from '@/components/CodeBlockToolbar';
import LikeButton from '@/components/LikeButton';
import { STATUS } from '@/lib/supabase/auth';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { fetchKpiBySlug, type NormalizedKpi } from '@/lib/server/kpis';
import { GroupedFields } from '@/components/detail/GroupedFields';
import type { GroupConfig } from '@/src/types/fields';

type Heading = {
  id: string;
  text: string;
  level: number;
};

function renderDetailRow(label: string, value: string | null | undefined, key: string): JSX.Element | null {
  if (!value) return null;
  return (
    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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

// Some legacy KPIs have SQL stored as a JSON array of strings with <br> tags
// and an initial "sql" marker. Normalize that into clean multiline SQL text.
function normalizeSqlQuery(raw?: string | null): string | null {
  if (!raw) return null;
  let text = raw;

  // Try to parse JSON array form: ["sql<br>...", "<br> ..."]
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        text = parsed.join('');
      }
    }
  } catch {
    // ignore JSON parse errors and fall back to raw string
  }

  // Replace HTML <br> tags with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip a leading "sql" marker if present (e.g. "sql\nSELECT..." or "sqlSELECT")
  text = text.replace(/^\s*sql\s*/i, '');

  return text;
}

// Some legacy KPIs have JSON mappings stored with <br> tags, optional "json" markers,
// or even as JSON arrays of string fragments. Normalize into pretty-printed JSON.
function normalizeJsonMapping(raw?: string | null): string | null {
  if (!raw) return null;
  let text = raw;

  // Try to parse JSON if it looks like JSON
  try {
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    }
  } catch {
    // ignore parse errors and fall back to string normalization
  }

  // Replace HTML <br> tags with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip a leading "json" marker if present
  text = text.replace(/^\s*json\s*/i, '');

  return text;
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

export default async function KPIDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let supabase;
  let user;
  let kpi;
  
  try {
    supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;

    // Use regular client (not admin) - RLS policies handle access control
    kpi = await fetchKpiBySlug(supabase, slug);
  } catch (error) {
    console.error('[KPIDetailPage] Error fetching KPI:', {
      slug,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Error Loading KPI</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '1rem' }}>
          There was an error loading this KPI. Please try again later.
        </p>
        <Link href="/kpis" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to KPIs
        </Link>
      </main>
    );
  }

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

  const identifiers = collectUserIdentifiers(user);
  const isOwner = kpi.created_by ? identifiers.includes(kpi.created_by) : false;
  const isVisible = kpi.status === STATUS.PUBLISHED || isOwner;

  if (!isVisible) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>KPI Not Available</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          This KPI is currently in draft. Sign in with the owner account to view it.
        </p>
        <Link href="/kpis" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to KPIs
        </Link>
      </main>
    );
  }

  const canEdit = isOwner && kpi.status === STATUS.DRAFT;
  const headings = buildHeadings(kpi);

  return (
    <main className="page-main">
      <div className="page-grid-3col">
        <Sidebar section="kpis" />

        <article className="detail-article">
          <div className="detail-header">
            <Link href="/kpis" className="detail-back-link">
              ← Back to KPIs
            </Link>
            <div className="detail-header-row">
              <div style={{ flex: 1 }}>
                <h1 className="detail-title">
                  {kpi.name}
                  {kpi.status === STATUS.DRAFT && (
                    <span className="badge-draft">Draft</span>
                  )}
                </h1>
                {kpi.description && (
                  <p className="detail-description">{kpi.description}</p>
                )}
              </div>

              <div className="detail-header-actions">
                <LikeButton itemType="kpi" itemId={kpi.id} itemSlug={kpi.slug} />
                {canEdit && (
                  <Link
                    href={`/kpis/${kpi.slug}/edit`}
                    className="btn btn-primary"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>

          {renderRichTextBlock('details', 'Business Use case', kpi.details)}
          {renderRichTextBlock('Priority', 'Importance of KPI', kpi.priority)}
          {renderRichTextBlock('Core area', 'Core area of KPI Analysis', kpi.core_area ?? undefined)}
          {renderRichTextBlock('Scope', 'Scope at which KPI is analyzed', kpi.scope ?? undefined)}

          {renderCodeBlock('formula', 'Formula', kpi.formula, 'text')}
          {renderCodeBlock('sql-query', 'SQL Query', normalizeSqlQuery(kpi.sql_query), 'sql')}
          {renderRichTextBlock('calculation-notes', 'Calculation Notes', kpi.calculation_notes)}
          <section id="overview" className="section" style={{ lineHeight: '2', marginBottom: '2rem' }}>
            <h2 className="section-title">Events</h2>
            {renderTokenPills('Google Analytics 4', kpi.ga4_implementation ? [kpi.ga4_implementation] : [])}
            {renderTokenPills('Adobe', kpi.adobe_implementation ? [kpi.adobe_implementation] : [])}
            {renderTokenPills('Amplitude', kpi.amplitude_implementation ? [kpi.amplitude_implementation] : [])}
          </section>
          {renderCodeBlock('data-layer-mapping', 'Data Layer Mapping', normalizeJsonMapping(kpi.data_layer_mapping), 'json')}
          {renderCodeBlock('xdm-mapping', 'XDM Mapping', normalizeJsonMapping(kpi.xdm_mapping), 'json')}
          <section id="overview" className="section" style={{ lineHeight: '2', marginBottom: '2rem' }}>
            <h2 className="section-title">Governance</h2>
            {renderDetailRow('Created by', kpi.created_by, 'created-by')}
            {renderDetailRow('Created on', kpi.created_at ? new Date(kpi.created_at).toLocaleDateString() : null, 'created-on')}
            {renderDetailRow('Last modified by', kpi.last_modified_by ?? undefined, 'last-modified-by')}
            {renderDetailRow('Last modified on', kpi.last_modified_at ? new Date(kpi.last_modified_at).toLocaleDateString() : null, 'last-modified-on')}
            {renderDetailRow('Status', kpi.status ? kpi.status.toUpperCase() : null, 'status')}
          </section>

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

