import React from 'react';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import LikeButton from '@/components/LikeButton';
import EditPublishedButton from '@/components/EditPublishedButton';
import { fetchDashboardBySlug } from '@/lib/server/dashboards';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { STATUS } from '@/lib/supabase/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
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
    </main>
  );
}




