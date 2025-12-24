import React from 'react';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { STATUS } from '@/lib/supabase/auth';
import { fetchKpiBySlug } from '@/lib/server/kpis';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { getUserRoleServer } from '@/lib/roles/server';
import EntityEditForm from '@/components/forms/EntityEditForm';
import type { NormalizedKpi } from '@/lib/server/kpis';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function KPIEditPage({ params }: { params: Promise<{ slug: string }> }) {
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
          Please sign in with GitHub to edit KPIs.
        </p>
        <Link href={`/kpis/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to KPI
        </Link>
      </main>
    );
  }

  const admin = createAdminClient();
  const kpi = await fetchKpiBySlug(admin, slug);

  if (!kpi) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>KPI not found</h1>
        <Link href="/kpis" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to KPIs
        </Link>
      </main>
    );
  }

  const identifiers = collectUserIdentifiers(user);
  const isOwner = kpi.created_by ? identifiers.includes(kpi.created_by) : false;
  const role = await getUserRoleServer();
  const isEditor = role === 'admin' || role === 'editor';
  const canEditDraft = (isOwner || isEditor) && kpi.status === STATUS.DRAFT;

  if (!canEditDraft) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Edit unavailable</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>
          {kpi.status !== STATUS.DRAFT
            ? 'Once a KPI is published it can only be updated through Editorial Review.'
            : 'You do not have permission to edit this draft. Only the owner or an editor can edit drafts.'}
        </p>
        <Link href={`/kpis/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to KPI
        </Link>
      </main>
    );
  }

  return (
    <EntityEditForm
      entity={kpi as NormalizedKpi}
      entityType="kpi"
      slug={slug}
      canEdit={canEditDraft}
      entityId={kpi.id}
    />
  );
}

