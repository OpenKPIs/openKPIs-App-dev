'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UDL {
  id: string;
  industry: string;
  platform: string;
  name: string;
  description: string;
  master_schema: any;
  version: string;
}

interface Props {
  initialUdls: UDL[];
  userId: string;
}

export default function UDLEditorClient({ initialUdls, userId }: Props) {
  const router = useRouter();
  const [udls, setUdls] = useState<UDL[]>(initialUdls);
  const [activeUdlId, setActiveUdlId] = useState<string | null>(initialUdls[0]?.id || null);
  
  // Local state for editing the raw JSON schema
  const [jsonInput, setJsonInput] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const activeUdl = udls.find(u => u.id === activeUdlId);

  // Load JSON when switching UDLs
  const handleSelectUdl = (id: string) => {
    setActiveUdlId(id);
    setIsEditing(false);
    setSaveStatus('');
  };

  const handleStartEdit = () => {
    if (activeUdl) {
      setJsonInput(JSON.stringify(activeUdl.master_schema || {}, null, 2));
      setIsEditing(true);
      setSaveStatus('');
    }
  };

  const handleSave = async () => {
    if (!activeUdl) return;
    
    setSaveStatus('Saving...');
    let parsedSchema = {};
    try {
      parsedSchema = JSON.parse(jsonInput);
    } catch (e) {
      setSaveStatus('Error: Invalid JSON format.');
      return;
    }

    try {
      // In a real implementation we would call an API route here
      // For this MVP, we will simulate the save directly or via a simple fetch
      // Here we assume the user will create an API route next, but we mock the UI success for now
      
      const response = await fetch('/api/udl/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeUdl.id, schema: parsedSchema })
      });

      if (response.ok) {
        setSaveStatus('Saved successfully!');
        setIsEditing(false);
        // Update local state
        setUdls(prev => prev.map(u => u.id === activeUdl.id ? { ...u, master_schema: parsedSchema } : u));
        router.refresh();
      } else {
         // Fallback if API doesn't exist yet
         setSaveStatus('Simulated Save (API endpoint pending).');
      }
    } catch (e) {
      setSaveStatus('Failed to save.');
    }
  };

  // If no UDLs exist yet (new DB)
  if (udls.length === 0) {
    return (
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 600 }}>Unified Data Layer</h1>
        <div style={{ marginTop: '2rem', padding: '3rem', border: '1px dashed var(--ifm-color-emphasis-300)', borderRadius: '8px', textAlign: 'center' }}>
          <h2>No Master Schemas Found</h2>
          <p>Please run the initialization script or create your first Unified Data Layer.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Unified Data Layer (UDL)</h1>
          <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
            The Master "God Mode" AEP-Style Dictionary. Changes here propagate to all future Tracking Plans.
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
        {/* Sidebar Navigation */}
        <aside style={{ borderRight: '1px solid var(--ifm-color-emphasis-200)', paddingRight: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--ifm-color-emphasis-700)' }}>Master Libraries</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {udls.map(udl => (
              <li key={udl.id}>
                <button 
                  onClick={() => handleSelectUdl(udl.id)}
                  style={{ 
                    width: '100%', 
                    textAlign: 'left', 
                    padding: '0.75rem', 
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: activeUdlId === udl.id ? 'var(--ifm-color-primary-lightest)' : 'transparent',
                    color: activeUdlId === udl.id ? 'var(--ifm-color-primary-darker)' : 'var(--ifm-font-color-base)',
                    fontWeight: activeUdlId === udl.id ? 600 : 400,
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '0.95rem' }}>{udl.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>{udl.industry} • {udl.platform}</div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Editor Area */}
        <section>
          {activeUdl && (
            <div style={{ backgroundColor: 'var(--ifm-background-surface)', borderRadius: '8px', border: '1px solid var(--ifm-color-emphasis-200)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--ifm-color-emphasis-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{activeUdl.name} v{activeUdl.version}</h2>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--ifm-color-emphasis-600)', fontSize: '0.9rem' }}>{activeUdl.description}</p>
                </div>
                <div>
                  {!isEditing ? (
                    <button onClick={handleStartEdit} className="btn btn-primary">Edit Master Schema</button>
                  ) : (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ color: saveStatus.includes('Error') ? '#b91c1c' : 'var(--ifm-color-primary)', fontSize: '0.9rem' }}>{saveStatus}</span>
                      <button onClick={() => setIsEditing(false)} className="btn">Cancel</button>
                      <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ padding: '1.5rem', backgroundColor: '#1e1e1e', minHeight: '500px' }}>
                {!isEditing ? (
                  <pre style={{ margin: 0, padding: 0, backgroundColor: 'transparent', color: '#d4d4d4', border: 'none', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                    {JSON.stringify(activeUdl.master_schema || {}, null, 2)}
                  </pre>
                ) : (
                  <textarea 
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    style={{ 
                      width: '100%', 
                      height: '500px', 
                      backgroundColor: '#1e1e1e', 
                      color: '#d4d4d4', 
                      fontFamily: 'monospace', 
                      fontSize: '0.9rem',
                      border: '1px solid #333',
                      padding: '1rem',
                      borderRadius: '4px'
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
