import React from 'react';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { fetchDashboardBySlug } from '@/lib/server/dashboards';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { getUserRoleServer } from '@/lib/roles/server';
import EntityEditForm from '@/components/forms/EntityEditForm';
import { STATUS } from '@/lib/supabase/auth';
import type { NormalizedDashboard } from '@/lib/server/dashboards';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Sign in required</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Please sign in with GitHub to edit dashboards.
        </p>
        <Link href={`/dashboards/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Dashboard
        </Link>
      </main>
    );
  }

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
  const role = await getUserRoleServer();
  const isEditor = role === 'admin' || role === 'editor';
  const canEditDraft = (isOwner || isEditor) && dashboard.status === STATUS.DRAFT;

  if (!canEditDraft) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Edit unavailable</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          {dashboard.status !== STATUS.DRAFT
            ? 'Once a dashboard is published it can only be updated through Editorial Review.'
            : 'You do not have permission to edit this draft. Only the owner or an editor can edit drafts.'}
        </p>
        <Link href={`/dashboards/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <EntityEditForm
      entity={dashboard as NormalizedDashboard}
      entityType="dashboard"
      slug={slug}
      canEdit={canEditDraft}
      entityId={dashboard.id}
    />
  );
}





