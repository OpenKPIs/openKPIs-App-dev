import React from 'react';
import DashboardCanvasEditor from '../[slug]/edit/DashboardCanvasEditor';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SandboxCanvasPage() {
  // A completely mock dashboard object detached from Supabase
  const mockDashboard = {
    id: 'mock-sandbox-id',
    name: 'Dev Sandbox Dashboard',
    slug: 'sandbox',
    status: 'draft',
    layout_json: [],
    created_by: 'local-dev',
  };

  return (
    <>
      <div style={{ padding: '0.5rem 1rem', background: '#fef3c7', color: '#92400e', borderBottom: '1px solid #fde68a', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center' }}>
        ⚠️ You are currently in the Local Interactive Sandbox. Supabase Saving is Mocked.
      </div>
      {/* @ts-expect-error - bypassing NormalizedDashboard strict structural types for the local sandbox */}
      <DashboardCanvasEditor dashboard={mockDashboard} slug="sandbox" />
    </>
  );
}
