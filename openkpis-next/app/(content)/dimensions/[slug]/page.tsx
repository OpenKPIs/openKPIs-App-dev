import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import GiscusComments from '@/components/GiscusComments';
import Sidebar from '@/components/Sidebar';
import TableOfContents from '@/components/TableOfContents';
import LikeButton from '@/components/LikeButton';
import { fetchDimensionBySlug } from '@/lib/server/dimensions';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { GroupedFields } from '@/components/detail/GroupedFields';
import type { GroupConfig } from '@/src/types/fields';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DimensionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use regular client (not admin) - RLS policies handle access control
  const dimension = await fetchDimensionBySlug(supabase, slug);

  if (!dimension) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Dimension Not Found</h1>
        <Link href="/dimensions" style={{ color: 'var(--ifm-color-primary)' }}>← Back to Dimensions</Link>
      </main>
    );
  }

  const identifiers = collectUserIdentifiers(user);
  const isOwner = dimension.created_by ? identifiers.includes(dimension.created_by) : false;
  const isVisible = dimension.status === 'published' || isOwner;

  if (!isVisible) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Dimension Not Available</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          This dimension is still in draft. Sign in with the account that created it to view the content.
        </p>
        <Link href="/dimensions" style={{ color: 'var(--ifm-color-primary)' }}>← Back to Dimensions</Link>
      </main>
    );
  }

  const canEdit = isOwner && dimension.status === 'draft';

  const detailGroups: GroupConfig[] = [
    {
      id: 'classification',
      title: 'Classification',
      layout: 'rows',
      fields: [
        { key: 'category', label: 'Category', value: dimension.category },
        {
          key: 'tags',
          label: 'Tags',
          value: (dimension.tags ?? []).join(', '),
        },
      ],
    },
    {
      id: 'governance',
      title: 'Governance',
      layout: 'columns',
      columns: 2,
      fields: [
        {
          key: 'created-by',
          label: 'Created by',
          value: dimension.created_by,
        },
        {
          key: 'created-at',
          label: 'Created at',
          value: dimension.created_at
            ? new Date(dimension.created_at).toLocaleDateString()
            : null,
        },
      ],
    },
  ];

  return (
    <main style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem 1rem', overflowX: 'hidden' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 250px) minmax(0, 1fr) minmax(200px, 280px)',
        gap: '1.5rem',
        width: '100%',
        maxWidth: '100%',
      }}>
        <Sidebar section="dimensions" />

        <article style={{ minWidth: 0, overflowWrap: 'break-word', wordWrap: 'break-word' }}>
          <div style={{
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--ifm-color-emphasis-200)',
          }}>
            <Link href="/dimensions" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ifm-color-primary)', textDecoration: 'none', marginBottom: '1rem' }}>
              ← Back to Dimensions
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {dimension.name}
                  {dimension.status === 'draft' && (
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
                {dimension.description && (
                  <p style={{ fontSize: '1.125rem', color: 'var(--ifm-color-emphasis-600)' }}>
                    {dimension.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LikeButton itemType="dimension" itemId={dimension.id} itemSlug={dimension.slug} />
                {canEdit && (
                  <Link
                    href={`/dimensions/${slug}/edit`}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--ifm-color-primary)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
          <section id="details" style={{ marginBottom: '3rem' }}>
            <h2
              id="dimension-details"
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
              }}
            >
              Dimension Details
            </h2>
            <div
              style={{
                backgroundColor: 'var(--ifm-color-emphasis-50)',
                borderRadius: '12px',
                padding: '2rem',
              }}
            >
              <GroupedFields groups={detailGroups} />
            </div>
          </section>

          <div style={{ marginTop: '3rem' }}>
            <GiscusComments term={slug} category="dimensions" />
          </div>
        </article>

        <TableOfContents />
      </div>
    </main>
  );
}

