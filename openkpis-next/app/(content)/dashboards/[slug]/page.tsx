import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import LikeButton from '@/components/LikeButton';
import EditPublishedButton from '@/components/EditPublishedButton';
import { fetchDashboardBySlug } from '@/lib/server/dashboards';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { STATUS } from '@/lib/supabase/auth';
import { generateEntityMetadata, generateEntityStructuredData } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const admin = createAdminClient();
  const dashboard = await fetchDashboardBySlug(admin, slug);

  return generateEntityMetadata(dashboard, {
    type: 'dashboard',
    typeLabel: 'Dashboard',
    typeLabelPlural: 'Dashboards',
    path: '/dashboards',
  });
}

export default async function DashboardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createAdminClient();
  const dashboard = await fetchDashboardBySlug(admin, slug);

  if (!dashboard) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Dashboard not found</h1>
        <Link href="/dashboards" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Dashboards
        </Link>
      </main>
    );
  }

  const identifiers = collectUserIdentifiers(user);
  const isOwner = dashboard.created_by ? identifiers.includes(dashboard.created_by) : false;
  const isVisible = dashboard.status === 'published' || isOwner;

  if (!isVisible) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Dashboard Not Available</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          This dashboard is still in draft. Sign in with the account that created it to view the content.
        </p>
        <Link href="/dashboards" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Dashboards
        </Link>
      </main>
    );
  }

  const canEdit = isOwner && dashboard.status === STATUS.DRAFT;
  const tiles = dashboard.layout_json ?? [];
  const hasTiles = tiles.length > 0;

  const structuredData = generateEntityStructuredData(dashboard, {
    type: 'dashboard',
    typeLabel: 'Dashboard',
    typeLabelPlural: 'Dashboards',
    path: '/dashboards',
  });

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Link href="/dashboards" style={{ color: 'var(--ifm-color-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
        ← Back to Dashboards
      </Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginTop: '0.5rem' }}>
        {dashboard.name}
        {dashboard.status === 'draft' && (
          <span style={{
            marginLeft: '0.75rem',
            fontSize: '0.75rem',
            padding: '0.25rem 0.75rem',
            backgroundColor: '#fbbf24',
            color: '#78350f',
            borderRadius: '4px',
          }}>
            Draft
          </span>
        )}
      </h1>
      {dashboard.description && <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>{dashboard.description}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
        <LikeButton itemType="dashboard" itemId={dashboard.id} itemSlug={dashboard.slug} />
        {canEdit ? (
          <Link
            href={`/dashboards/${slug}/edit`}
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
        ) : dashboard.status === STATUS.PUBLISHED ? (
          <EditPublishedButton itemType="dashboard" itemId={dashboard.id} itemSlug={dashboard.slug} />
        ) : null}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
        {dashboard.category && (
          <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: 999, fontSize: '0.75rem' }}>
            {dashboard.category}
          </span>
        )}
        {dashboard.tags.map((t) => (
          <span key={t} style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: 999, fontSize: '0.75rem' }}>
            {t}
          </span>
        ))}
      </div>

      {hasTiles ? (
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(30,136,229,0.06)',
            border: '1px solid rgba(30,136,229,0.2)',
            borderRadius: '8px',
          }}>
            <span style={{ fontSize: '1rem' }}>📊</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--ifm-color-primary)', fontWeight: 500 }}>
              Preview Mode — Visualizations use sample data.
            </span>
            <Link href="/dashboards/data-viz" style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--ifm-color-primary)', textDecoration: 'underline' }}>
              Upload your own data →
            </Link>
          </div>
          <DashboardTilesGrid tiles={tiles} />
        </div>
      ) : (
        <div style={{ marginTop: '3rem', padding: '3rem', textAlign: 'center', border: '2px dashed var(--ifm-color-emphasis-200)', borderRadius: '12px', color: 'var(--ifm-color-emphasis-500)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
          <p style={{ margin: 0, fontWeight: 500 }}>No visualizations defined yet.</p>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Run the AI Analyst to generate a dashboard layout and save it here.</p>
        </div>
      )}
    </main>
  );
}

function DashboardTilesGrid({ tiles }: { tiles: Record<string, unknown>[] }) {
  return (
    <div>
      {groupTilesBySection(tiles).map((section, si) => (
        <div key={si} style={{ marginBottom: '2.5rem' }}>
          {section.title && (
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--ifm-color-emphasis-100)' }}>
              {section.title as string}
            </h3>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
            {(section.tiles as Record<string, unknown>[]).map((tile, ti) => (
              <div key={ti} style={{ border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '12px', padding: '1.25rem', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{tile.metric as string}</span>
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', background: 'var(--ifm-color-emphasis-100)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--ifm-color-emphasis-600)' }}>{tile.chart as string}</span>
                </div>
                <DashboardChartPlaceholder chartType={tile.chart as string} metric={tile.metric as string} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardChartPlaceholder({ chartType, metric }: { chartType: string; metric: string }) {
  return (
    <div style={{ height: '180px', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#666' }}>
      <span style={{ fontSize: '1.5rem' }}>
        {chartType === 'pie' ? '🥧' : chartType === 'bar' ? '📊' : chartType === 'scorecard' ? '🎯' : '📈'}
      </span>
      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{metric}</span>
      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Interactive chart loads client-side</span>
    </div>
  );
}

type TileSection = { title?: string; tiles: Record<string, unknown>[] };
function groupTilesBySection(tiles: Record<string, unknown>[]): TileSection[] {
  const sections: TileSection[] = [];
  let current: TileSection = { tiles: [] };

  for (const tile of tiles) {
    if (tile.section_title) {
      if (current.tiles.length > 0 || current.title) sections.push(current);
      current = { title: String(tile.section_title), tiles: [] };
    }
    current.tiles.push(tile);
  }
  if (current.tiles.length > 0 || current.title) sections.push(current);
  if (sections.length === 0 && tiles.length > 0) return [{ tiles }];
  return sections;
}
