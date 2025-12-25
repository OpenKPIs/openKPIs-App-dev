import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { collectUserIdentifiers, listEntitiesForServer } from '@/lib/server/entities';
import KPIsClient from './KPIsClient';
import { generateListingMetadata } from '@/lib/seo/metadata';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  return generateListingMetadata({
    type: 'kpi',
    typeLabel: 'KPI',
    typeLabelPlural: 'KPIs',
    path: '/kpis',
  });
}

export default async function KPIsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const items = await listEntitiesForServer({
    kind: 'kpi',
    includeIdentifiers: collectUserIdentifiers(user),
  });

  return <KPIsClient items={items} initialUser={user} />;
}
