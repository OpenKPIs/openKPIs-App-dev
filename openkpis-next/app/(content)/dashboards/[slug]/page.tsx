'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LikeButton from '@/components/LikeButton';
import AddToAnalysisButton from '@/components/AddToAnalysisButton';
import { supabase } from '@/lib/supabase';

export default function DashboardDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      (async () => {
        try {
          const { data } = await supabase
            .from('dashboards')
            .select('*')
            .eq('slug', slug)
            .single();
          setDashboard(data);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [slug]);

  if (loading) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </main>
    );
  }

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

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/dashboards" style={{ color: 'var(--ifm-color-primary)', textDecoration: 'none', fontSize: '0.875rem' }}>
        ← Back to Dashboards
      </Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginTop: '0.5rem' }}>{dashboard.name}</h1>
      {dashboard.description && <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>{dashboard.description}</p>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
        {dashboard && (
          <>
            <LikeButton itemType="dashboard" itemId={dashboard.id} itemSlug={dashboard.slug} />
            <AddToAnalysisButton
              itemType="dashboard"
              itemId={dashboard.id}
              itemSlug={dashboard.slug}
              itemName={dashboard.name}
            />
          </>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
        {dashboard.category && (
          <span style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: 999, fontSize: '0.75rem' }}>
            {dashboard.category}
          </span>
        )}
        {(dashboard.tags || []).map((t: string) => (
          <span key={t} style={{ padding: '0.25rem 0.75rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: 999, fontSize: '0.75rem' }}>
            {t}
          </span>
        ))}
      </div>
    </main>
  );
}




