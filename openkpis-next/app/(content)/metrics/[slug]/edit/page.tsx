import React from 'react';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { STATUS } from '@/lib/supabase/auth';
import { fetchMetricBySlug } from '@/lib/server/metrics';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { getUserRoleServer } from '@/lib/roles/server';
import EntityEditForm from '@/components/forms/EntityEditForm';
import type { NormalizedMetric } from '@/lib/server/metrics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MetricEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Sign in required</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>
          Please sign in with GitHub to edit metrics.
        </p>
        <Link href={`/metrics/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Metric
        </Link>
      </main>
    );
  }

  const admin = createAdminClient();
  const metric = await fetchMetricBySlug(admin, slug);

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
  const role = await getUserRoleServer();
  const isEditor = role === 'admin' || role === 'editor';
  const canEditDraft = (isOwner || isEditor) && metric.status === STATUS.DRAFT;

  if (!canEditDraft) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Edit unavailable</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>
          {metric.status !== STATUS.DRAFT
            ? 'Once a metric is published it can only be updated through Editorial Review.'
            : 'You do not have permission to edit this draft. Only the owner or an editor can edit drafts.'}
        </p>
        <Link href={`/metrics/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Metric
        </Link>
      </main>
    );
  }

  return (
    <EntityEditForm
      entity={metric as NormalizedMetric}
      entityType="metric"
      slug={slug}
      canEdit={canEditDraft}
      entityId={metric.id}
    />
  );
}





