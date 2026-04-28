import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';
import ProjectsClient from './ProjectsClient';

export const metadata = {
  title: 'My Projects | OpenKPIs',
  description: 'Manage your Tracking Plans and AI Analyst sessions.',
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?next=/projects');
  }

  // Fetch Tracking Plans
  const { data: trackingPlans, error: plansError } = await supabase
    .from(withTablePrefix('tracking_plans'))
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (plansError) {
    console.error('Error fetching tracking plans:', plansError);
  }

  // Fetch Analyses
  const { data: analyses, error: analysesError } = await supabase
    .from(withTablePrefix('user_analyses'))
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (analysesError) {
    console.error('Error fetching analyses:', analysesError);
  }

  return (
    <main className="page-main" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>My Projects</h1>
          <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>Manage your Tracking Plans and AI Analyst sessions.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/planner" className="btn btn-primary">
            New Tracking Plan
          </Link>
          <Link href="/ai-analyst" className="btn btn-secondary">
            New Analysis
          </Link>
        </div>
      </div>

      <ProjectsClient 
        initialPlans={trackingPlans || []} 
        initialAnalyses={analyses || []} 
      />
    </main>
  );
}
