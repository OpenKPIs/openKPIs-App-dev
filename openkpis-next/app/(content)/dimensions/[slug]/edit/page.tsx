import React from 'react';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { STATUS } from '@/lib/supabase/auth';
import { fetchDimensionBySlug } from '@/lib/server/dimensions';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { getUserRoleServer } from '@/lib/roles/server';
import DimensionEditClient, { type EditableDimension } from './DimensionEditClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DimensionEditPage({ params }: { params: Promise<{ slug: string }> }) {
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
          Please sign in with GitHub to edit dimensions.
        </p>
        <Link href={`/dimensions/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Dimension
        </Link>
      </main>
    );
  }

  const admin = createAdminClient();
  const dimension = await fetchDimensionBySlug(admin, slug);

  if (!dimension) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Dimension not found</h1>
        <Link href="/dimensions" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Dimensions
        </Link>
      </main>
    );
  }

  const identifiers = collectUserIdentifiers(user);
  const isOwner = dimension.created_by ? identifiers.includes(dimension.created_by) : false;
  const role = await getUserRoleServer();
  const isEditor = role === 'admin' || role === 'editor';
  const canEditDraft = (isOwner || isEditor) && dimension.status === STATUS.DRAFT;

  if (!canEditDraft) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Edit unavailable</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          {dimension.status !== STATUS.DRAFT
            ? 'Once a dimension is published it can only be updated through Editorial Review.'
            : 'You do not have permission to edit this draft. Only the owner or an editor can edit drafts.'}
        </p>
        <Link href={`/dimensions/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Dimension
        </Link>
      </main>
    );
  }

  return <DimensionEditClient dimension={dimension as EditableDimension} slug={slug} canEdit />;
}





