import GitHubSignIn from '@/components/GitHubSignIn';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';
import { collectUserIdentifiers, listEntitiesForServer } from '@/lib/server/entities';
import type { AnyEntity } from '@/src/types/entities';

import { Suspense } from 'react';
import AIAnalystClient from './AIAnalystClient';
import type { ExistingItem } from './types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === 'string');
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((tag): tag is string => typeof tag === 'string');
      }
    } catch {
      // fall through
    }
  }
  return [];
}

function toExistingItems(entities: AnyEntity[]): ExistingItem[] {
  const seen = new Set<string>();
  return entities
    .filter((entity) => typeof entity.slug === 'string' && entity.slug.length > 0)
    .filter((entity) => {
      const key = `${entity.slug}:${entity.status ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((entity) => ({
      id: entity.id,
      name: entity.name,
      description: entity.description ?? undefined,
      category: entity.category ?? undefined,
      tags: normalizeTags(entity.tags),
      slug: entity.slug!,
    }));
}

export default async function AIAnalystPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { restore } = await searchParams;
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  // ── DEV BYPASS ─────────────────────────────────────────────────────────────
  // Set NEXT_PUBLIC_DEV_BYPASS_AUTH=true in .env.local to skip login locally.
  // This env var is NOT set in production, so the guard remains active there.
  const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';
  const user = devBypass
    ? { id: '11111111-1111-1111-1111-111111111111', email: 'dev@localhost.local' }
    : session?.user ?? null;

  if (!devBypass && !user) {
    return (
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--ifm-color-emphasis-100)',
            borderRadius: '8px',
            border: '1px solid var(--ifm-color-emphasis-300)',
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1rem' }}>🔒 AI Analyst</div>
          <p
            style={{
              fontSize: '1.125rem',
              color: 'var(--ifm-color-emphasis-700)',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem',
            }}
          >
            Please log in to use the advanced AI Analyst feature. Sign in with GitHub to get personalized KPI recommendations,
            dashboard suggestions, and insights.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            <GitHubSignIn />
          </div>
        </div>
      </main>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const includeIdentifiers = devBypass ? [] : collectUserIdentifiers(user as any);
  const [kpis, metrics, dimensions] = await Promise.all([
    listEntitiesForServer({ kind: 'kpi', includeIdentifiers }),
    listEntitiesForServer({ kind: 'metric', includeIdentifiers }),
    listEntitiesForServer({ kind: 'dimension', includeIdentifiers }),
  ]);

  const existingItems = {
    kpis: toExistingItems(kpis),
    metrics: toExistingItems(metrics),
    dimensions: toExistingItems(dimensions),
  };

  let initialAnalysisState = null;
  if (restore && typeof restore === 'string') {
    const { data } = await supabase
      .from(withTablePrefix('user_analyses'))
      .select('analysis_data')
      .eq('id', restore)
      .single();
      
    if (data && data.analysis_data) {
      initialAnalysisState = data.analysis_data;
    }
  }

  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center', fontSize: '1.25rem', color: '#64748b' }}>Loading AI Analyst Workspace...</div>}>
      <AIAnalystClient existingItems={existingItems} initialAnalysisState={initialAnalysisState} />
    </Suspense>
  );
}
