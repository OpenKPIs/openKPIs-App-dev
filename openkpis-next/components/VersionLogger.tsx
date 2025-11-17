'use client';

import React from 'react';

export default function VersionLogger() {
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/debug/version', { cache: 'no-store' });
        const v = await res.json();
        const sha = (v?.git?.sha || '').toString();
        const shaShort = sha ? sha.substring(0, 7) : 'unknown';
        // High-signal single line for easy comparison across URLs
        console.log(
          `[OpenKPIs] version=%s branch=%s env=%s host=%s msg=%s`,
          shaShort,
          v?.git?.branch || 'unknown',
          v?.env || 'unknown',
          typeof window !== 'undefined' ? window.location.host : 'server',
          (v?.git?.message || '').slice(0, 80)
        );
      } catch (e) {
        // Swallow errors; logging is best-effort
      }
    })();
  }, []);

  return null;
}


