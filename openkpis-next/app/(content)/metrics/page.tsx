'use client';

import Catalog from '@/components/Catalog';

export default function MetricsPage() {
  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Metrics
        </h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Standardized metrics and measurements for analytics.
        </p>
      </div>
      <Catalog section="metrics" />
    </main>
  );
}

