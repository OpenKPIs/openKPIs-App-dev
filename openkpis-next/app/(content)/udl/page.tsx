import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import UDLEditorClient from './UDLEditorClient';

export const dynamic = 'force-dynamic';

export default async function UDLPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem' }}>Unified Data Layer</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', marginBottom: '1.5rem' }}>
          Please sign in to view and edit the master Unified Data Layer schemas.
        </p>
        <Link href="/" className="btn btn-primary">Return Home</Link>
      </main>
    );
  }

  // Fetch all existing Master UDLs
  const { data: udls, error } = await supabase
    .from('dev_unified_data_layers')
    .select('*')
    .order('industry', { ascending: true })
    .order('platform', { ascending: true });

  if (error) {
    return (
      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '1rem', color: '#b91c1c' }}>Error Loading UDLs</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-700)' }}>
          Could not connect to the Unified Data Layer database. Please ensure the migration script has been run.
        </p>
      </main>
    );
  }

  return <UDLEditorClient initialUdls={udls || []} userId={user.id} />;
}
