import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { collectUserIdentifiers, listEntitiesForServer } from '@/lib/server/entities';
import Catalog from '@/components/Catalog';
import { generateListingMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return generateListingMetadata({
    type: 'event',
    typeLabel: 'Event',
    typeLabelPlural: 'Events',
    path: '/events',
  });
}

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const items = await listEntitiesForServer({
    kind: 'event',
    includeIdentifiers: collectUserIdentifiers(user),
  });

  return <Catalog kind="event" items={items} />;
}