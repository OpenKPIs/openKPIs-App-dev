import React from 'react';
import Link from 'next/link';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { STATUS } from '@/lib/supabase/auth';
import { fetchEventBySlug } from '@/lib/server/events';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { getUserRoleServer } from '@/lib/roles/server';
import EventEditClient, { type EditableEvent } from './EventEditClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventEditPage({ params }: { params: Promise<{ slug: string }> }) {
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
          Please sign in with GitHub to edit events.
        </p>
        <Link href={`/events/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Event
        </Link>
      </main>
    );
  }

  const admin = createAdminClient();
  const event = await fetchEventBySlug(admin, slug);

  if (!event) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Event not found</h1>
        <Link href="/events" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Events
        </Link>
      </main>
    );
  }

  const identifiers = collectUserIdentifiers(user);
  const isOwner = event.created_by ? identifiers.includes(event.created_by) : false;
  const role = await getUserRoleServer();
  const isEditor = role === 'admin' || role === 'editor';
  const canEditDraft = (isOwner || isEditor) && event.status === STATUS.DRAFT;

  if (!canEditDraft) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Edit unavailable</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          {event.status !== STATUS.DRAFT
            ? 'Once an event is published it can only be updated through Editorial Review.'
            : 'You do not have permission to edit this draft. Only the owner or an editor can edit drafts.'}
        </p>
        <Link href={`/events/${slug}`} style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Event
        </Link>
      </main>
    );
  }

  return <EventEditClient event={event as EditableEvent} slug={slug} canEdit />;
}





