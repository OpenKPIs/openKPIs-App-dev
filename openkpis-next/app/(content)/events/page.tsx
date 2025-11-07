'use client';

import Catalog from '@/components/Catalog';

export default function EventsPage() {
  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Events
        </h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Tracking events and parameters needed to calculate KPIs across different platforms.
        </p>
      </div>
      <Catalog section="events" />
    </main>
  );
}

