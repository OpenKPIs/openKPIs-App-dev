import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import GiscusComments from '@/components/GiscusComments';
import Sidebar from '@/components/Sidebar';
import TableOfContents from '@/components/TableOfContents';
import LikeButton from '@/components/LikeButton';
import { withTablePrefix } from '@/src/types/entities';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { GroupedFields } from '@/components/detail/GroupedFields';
import type { GroupConfig } from '@/src/types/fields';

const eventsTable = withTablePrefix('events');

type EventRow = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category?: string | null;
  tags?: string[] | string | null;
  status: 'draft' | 'published' | 'archived';
  created_by?: string | null;
  created_at?: string | null;
};

function toStringArray(value: string[] | string | null | undefined): string[] {
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use regular client (not admin) - RLS policies handle access control
  const { data: rawEvent, error } = await supabase
    .from(eventsTable)
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  const event = rawEvent as EventRow | null;

  if (error || !event) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Event Not Found</h1>
        <Link href="/events" style={{ color: 'var(--ifm-color-primary)' }}>← Back to Events</Link>
      </main>
    );
  }

  const identifiers = collectUserIdentifiers(user);
  const isOwner = event.created_by ? identifiers.includes(event.created_by) : false;
  const isVisible = event.status === 'published' || isOwner;

  if (!isVisible) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Event Not Available</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          This event is still in draft. Sign in with the account that created it to view the content.
        </p>
        <Link href="/events" style={{ color: 'var(--ifm-color-primary)' }}>← Back to Events</Link>
      </main>
    );
  }

  const normalizedEvent = {
    ...event,
    tags: toStringArray(event.tags),
  };

  const canEdit = isOwner && normalizedEvent.status === 'draft';

  const detailGroups: GroupConfig[] = [
    {
      id: 'classification',
      title: 'Classification',
      layout: 'rows',
      fields: [
        {
          key: 'category',
          label: 'Category',
          value: normalizedEvent.category,
        },
        {
          key: 'tags',
          label: 'Tags',
          value: (normalizedEvent.tags ?? []).join(', '),
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
          value: normalizedEvent.created_by,
        },
        {
          key: 'created-at',
          label: 'Created at',
          value: normalizedEvent.created_at
            ? new Date(normalizedEvent.created_at).toLocaleDateString()
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
        <Sidebar section="events" />

        <article style={{ minWidth: 0, overflowWrap: 'break-word', wordWrap: 'break-word' }}>
          <div style={{
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--ifm-color-emphasis-200)',
          }}>
            <Link href="/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ifm-color-primary)', textDecoration: 'none', marginBottom: '1rem' }}>
              ← Back to Events
            </Link>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {normalizedEvent.name}
                  {normalizedEvent.status === 'draft' && (
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
                {normalizedEvent.description && (
                  <p style={{ fontSize: '1.125rem', color: 'var(--ifm-color-emphasis-600)' }}>
                    {normalizedEvent.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <LikeButton itemType="event" itemId={normalizedEvent.id} itemSlug={normalizedEvent.slug} />
                {canEdit && (
                  <Link
                    href={`/events/${slug}/edit`}
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
              id="event-details"
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1.5rem',
              }}
            >
              Event Details
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
            <GiscusComments term={slug} category="events" />
          </div>
        </article>

        <TableOfContents />
      </div>
    </main>
  );
}

