'use client';

import React from 'react';
import Link from 'next/link';
import { config } from '@/lib/config';

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        Your privacy matters. This page explains what we collect, how we use it, and your choices.
      </p>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Information we collect</h2>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--ifm-color-emphasis-800)' }}>
          <li>
            <strong>Account data</strong>: If you sign in with GitHub, we receive your GitHub user id,
            username, avatar URL, and email (when available). This is used to personalize your account and
            attribute contributions.
          </li>
          <li>
            <strong>Usage data</strong>: We may collect basic, aggregated usage metrics to improve the
            product experience (for example, Google Tag Manager-based analytics).
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>How we use data</h2>
        <ul style={{ paddingLeft: '1.25rem', lineHeight: 1.8, color: 'var(--ifm-color-emphasis-800)' }}>
          <li>Authenticate users and maintain sessions.</li>
          <li>Enable contribution workflows and attribute edits to users.</li>
          <li>Improve site reliability and user experience.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Cookies & storage</h2>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.7 }}>
          We use cookies and local storage primarily for authentication (Supabase session cookies).
          Disabling cookies may limit functionality such as sign-in.
        </p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Data sharing</h2>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.7 }}>
          We do not sell your data. Limited data may be shared with infrastructure providers (e.g., Supabase
          for authentication) to operate the service.
        </p>
      </section>

      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Contact</h2>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', lineHeight: 1.7 }}>
          Questions or requests? Please open an issue on{' '}
          <a href={config.github.contentRepoUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ifm-color-primary)' }}>
            GitHub
          </a>{' '}
          or start by browsing the{' '}
          <Link href="/kpis" style={{ color: 'var(--ifm-color-primary)' }}>catalog</Link>.
        </p>
      </section>
    </main>
  );
}


