import React from 'react';


export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        marginTop: '3rem',
        padding: '2rem 1rem',
        borderTop: '1px solid var(--ifm-color-emphasis-200)',
        backgroundColor: 'var(--ifm-background-color)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div style={{ color: 'var(--ifm-color-emphasis-700)', fontSize: '0.9rem' }}>
          © {year} OpenKPIs. All rights reserved.
        </div>
        <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
          <a href="/about" style={{ textDecoration: 'none', color: 'var(--ifm-font-color-base)' }}>
            About
          </a>
          <a href="/privacy" style={{ textDecoration: 'none', color: 'var(--ifm-font-color-base)' }}>
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
}


