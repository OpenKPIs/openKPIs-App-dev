'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { withTablePrefix } from '@/src/types/entities';

interface ProjectData {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface AnalysisData {
  id: string;
  created_at: string;
  analysis_data?: {
    requirements?: string;
    items?: {
      kpis?: { name: string; [key: string]: unknown }[];
      metrics?: { name: string; [key: string]: unknown }[];
      dimensions?: { name: string; [key: string]: unknown }[];
    };
    dashboards?: { title?: string; [key: string]: unknown }[];
    insights?: { title?: string; [key: string]: unknown }[];
  };
}

interface ProjectsClientProps {
  initialPlans: ProjectData[];
  initialAnalyses: AnalysisData[];
}

export default function ProjectsClient({ initialPlans, initialAnalyses }: ProjectsClientProps) {
  const [activeTab, setActiveTab] = useState<'plans' | 'analyses'>('plans');
  const [plans, setPlans] = useState<ProjectData[]>(initialPlans);
  const [analyses, setAnalyses] = useState<AnalysisData[]>(initialAnalyses);

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Tracking Plan?')) return;
    const { error } = await supabase.from(withTablePrefix('tracking_plans')).delete().eq('id', id);
    if (!error) {
      setPlans(plans.filter(p => p.id !== id));
    } else {
      alert('Error deleting plan: ' + error.message);
    }
  };

  const handleDeleteAnalysis = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Analysis Session?')) return;
    const { error } = await supabase.from(withTablePrefix('user_analyses')).delete().eq('id', id);
    if (!error) {
      setAnalyses(analyses.filter(a => a.id !== id));
    } else {
      alert('Error deleting analysis: ' + error.message);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('plans')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'plans' ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
            color: activeTab === 'plans' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
            fontWeight: activeTab === 'plans' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          My Tracking Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab('analyses')}
          style={{
            padding: '1rem 2rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analyses' ? '2px solid var(--ifm-color-primary)' : '2px solid transparent',
            color: activeTab === 'analyses' ? 'var(--ifm-color-primary)' : 'var(--ifm-color-emphasis-600)',
            fontWeight: activeTab === 'analyses' ? '600' : '500',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          My Analyst Sessions ({analyses.length})
        </button>
      </div>

      {activeTab === 'plans' && (
        <div>
          {plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--ifm-color-emphasis-50)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '1rem' }}>You don&apos;t have any saved Tracking Plans yet.</p>
              <Link href="/planner" className="btn btn-primary">Create Your First Plan</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {plans.map((plan) => (
                <div key={plan.id} className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600' }}>{plan.name}</h3>
                  <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {plan.description || 'No description provided.'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-500)', marginBottom: '1.5rem' }}>
                    Updated {new Date(plan.updated_at).toLocaleDateString()}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/planner?id=${plan.id}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                      Open Plan
                    </Link>
                    <button onClick={() => handleDeletePlan(plan.id)} className="btn btn-danger" style={{ padding: '0.5rem' }} title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'analyses' && (
        <div>
          {analyses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--ifm-color-emphasis-50)', borderRadius: '8px' }}>
              <p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: '1rem' }}>You don&apos;t have any saved Analyst sessions yet.</p>
              <Link href="/ai-analyst" className="btn btn-primary">Start New Analysis</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {analyses.map((analysis) => {
                const title = analysis.analysis_data?.requirements 
                  ? `"${analysis.analysis_data.requirements.substring(0, 50)}${analysis.analysis_data.requirements.length > 50 ? '...' : ''}"`
                  : 'Untitled Analysis';
                
                const stats = [];
                const itemsCount = 
                  (analysis.analysis_data?.items?.kpis?.length || 0) + 
                  (analysis.analysis_data?.items?.metrics?.length || 0) + 
                  (analysis.analysis_data?.items?.dimensions?.length || 0);
                
                if (itemsCount > 0) stats.push(`${itemsCount} Items`);
                if (analysis.analysis_data?.insights?.length) stats.push(`${analysis.analysis_data.insights.length} Insights`);
                if (analysis.analysis_data?.dashboards?.length) stats.push(`${analysis.analysis_data.dashboards.length} Dashboards`);

                return (
                  <div key={analysis.id} className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600', lineHeight: 1.4 }}>{title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {stats.map(stat => (
                        <span key={stat} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--ifm-color-emphasis-100)', borderRadius: '4px' }}>
                          {stat}
                        </span>
                      ))}
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--ifm-color-emphasis-500)', marginBottom: '1.5rem' }}>
                      Saved {new Date(analysis.created_at).toLocaleDateString()}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/ai-analyst?restore=${analysis.id}`} className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                        Restore Session
                      </Link>
                      <button onClick={() => handleDeleteAnalysis(analysis.id)} className="btn btn-danger" style={{ padding: '0.5rem' }} title="Delete">
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
