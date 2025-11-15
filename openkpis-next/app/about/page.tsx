'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>About OpenKPIs</h1>
      <p style={{ color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        OpenKPIs is a community-driven catalog of standardized KPIs, Metrics, Dimensions, and Events
        for modern analytics teams. Our goal is to help organizations measure consistently, speak a
        common language, and accelerate implementation across analytics platforms.
      </p>

      <section style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>What you’ll find</h2>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--ifm-color-emphasis-800)' }}>
          <li>Clear definitions for KPIs and supporting metrics</li>
          <li>Dimensions and events to enable accurate measurement</li>
          <li>Platform implementation notes (GA4, Adobe, Amplitude) where available</li>
          <li>draft → publish lifecycle for quality and consistency</li>
        </ul>
      </section>

      <section style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>How it works</h2>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.7 }}>
          Browse public content freely. Sign in with GitHub to contribute new items or propose edits.
          Editors review and publish high-quality contributions. Source content is synchronized to GitHub
          for transparency and version control.
        </p>
      </section>

      <section style={{ marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Get involved</h2>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.7 }}>
          We welcome contributions! You can create new definitions, improve documentation, and suggest
          implementation guidance. Star and follow our repository for updates.
        </p>
        <p>
          <a
            href="https://github.com/devyendarm/OpenKPIs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            Visit GitHub
          </a>
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Questions?</h2>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.7 }}>
          Have feedback or an idea? Open an issue on GitHub or start by browsing the{' '}
          <Link href="/kpis" style={{ color: 'var(--ifm-color-primary)' }}>KPIs</Link>.
        </p>
      </section>
    </main>
  );
}


