import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import LikeButton from '@/components/LikeButton';
import { STATUS } from '@/lib/supabase/auth';
import { fetchMetricBySlug } from '@/lib/server/metrics';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { GroupedFields } from '@/components/detail/GroupedFields';
import type { GroupConfig } from '@/src/types/fields';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MetricDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use regular client (not admin) - RLS policies handle access control
  const metric = await fetchMetricBySlug(supabase, slug);

  if (!metric) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Metric not found</h1>
        <Link href="/metrics" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Metrics
        </Link>
      </main>
    );
  }

  const identifiers = collectUserIdentifiers(user);
  const isOwner = metric.created_by ? identifiers.includes(metric.created_by) : false;
  const isVisible = metric.status === STATUS.PUBLISHED || isOwner;

  if (!isVisible) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Metric not available</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          This metric is still in draft. Sign in with the account that created it to view the content.
        </p>
        <Link href="/metrics" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Metrics
        </Link>
      </main>
    );
  }

  const canEdit = isOwner && metric.status === STATUS.DRAFT;

  const governanceGroups: GroupConfig[] = [
    {
      id: 'governance',
      title: 'Governance',
      layout: 'columns',
      columns: 2,
      fields: [
        {
          key: 'created-by',
          label: 'Created by',
          value: metric.created_by,
        },
        {
          key: 'created-on',
          label: 'Created on',
          value: metric.created_at
            ? new Date(metric.created_at).toLocaleDateString()
            : null,
        },
        {
          key: 'status',
          label: 'Status',
          value: metric.status ? metric.status.toUpperCase() : null,
        },
      ],
    },
  ];

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/metrics" style={{ color: 'var(--ifm-color-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
        ← Back to Metrics
      </Link>

      <header style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{metric.name}</h1>
          {metric.description && (
            <p style={{ color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.6 }}>{metric.description}</p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
            {metric.category ? (
              <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: 999, fontSize: '0.75rem', fontWeight: 500 }}>
                {metric.category}
              </span>
            ) : null}
            {metric.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: 'var(--ifm-color-emphasis-100)',
                  borderRadius: 999,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LikeButton itemType="metric" itemId={metric.id} itemSlug={metric.slug} />
          {canEdit && (
            <Link
              href={`/metrics/${metric.slug}/edit`}
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
      </header>

      {metric.formula && (
        <section style={{ marginTop: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>Formula</h2>
          <div style={{ background: 'var(--ifm-color-emphasis-50)', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 8, padding: '1rem' }}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{metric.formula}</pre>
          </div>
        </section>
      )}

      <section style={{ marginTop: '2rem' }}>
        <GroupedFields groups={governanceGroups} />
      </section>
    </main>
  );
}




