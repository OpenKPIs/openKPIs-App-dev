'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LeaderboardPage() {
  const [contributors, setContributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      // Load user profiles with contribution stats
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('total_contributions', { ascending: false })
        .limit(100);

      if (!error && data) {
        setContributors(data);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Contributor Leaderboard
        </h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          Top contributors to the OpenKPIs repository
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--ifm-color-emphasis-50)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--ifm-color-emphasis-100)', borderBottom: '2px solid var(--ifm-color-emphasis-200)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Rank</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Contributor</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>KPIs</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Events</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Dimensions</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Metrics</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {contributors.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--ifm-color-emphasis-600)' }}>
                  No contributors yet
                </td>
              </tr>
            ) : (
              contributors.map((contributor, index) => (
                <tr
                  key={contributor.id}
                  style={{
                    borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                  }}
                >
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor:
                          index === 0
                            ? '#FFD700'
                            : index === 1
                            ? '#C0C0C0'
                            : index === 2
                            ? '#CD7F32'
                            : 'var(--ifm-color-emphasis-200)',
                        color: index < 3 ? 'white' : 'var(--ifm-font-color-base)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                      }}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {contributor.avatar_url && (
                        <img
                          src={contributor.avatar_url}
                          alt={contributor.full_name || contributor.github_username}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {contributor.full_name || contributor.github_username || 'Anonymous'}
                        </div>
                        {contributor.github_username && (
                          <a
                            href={`https://github.com/${contributor.github_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '0.875rem',
                              color: 'var(--ifm-color-primary)',
                              textDecoration: 'none',
                            }}
                          >
                            @{contributor.github_username}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{contributor.total_kpis || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{contributor.total_events || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{contributor.total_dimensions || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{contributor.total_metrics || 0}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>
                    {contributor.total_contributions || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

