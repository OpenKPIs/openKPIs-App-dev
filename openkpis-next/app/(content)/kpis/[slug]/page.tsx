'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, getCurrentUser, STATUS } from '@/lib/supabase';
import GiscusComments from '@/components/GiscusComments';
import Sidebar from '@/components/Sidebar';
import TableOfContents from '@/components/TableOfContents';
import CodeBlockToolbar from '@/components/CodeBlockToolbar';
import LikeButton from '@/components/LikeButton';
import AddToAnalysisButton from '@/components/AddToAnalysisButton';

interface KPI {
  id: string;
  slug: string;
  name: string;
  description?: string;
  formula?: string;
  category?: string;
  tags?: string[] | string;
  industry?: string[] | string;
  priority?: string;
  core_area?: string;
  scope?: string;
  kpi_type?: string;
  metric?: string;
  aggregation_window?: string;
  ga4_implementation?: string;
  adobe_implementation?: string;
  amplitude_implementation?: string;
  data_layer_mapping?: string;
  xdm_mapping?: string;
  sql_query?: string;
  calculation_notes?: string;
  details?: string;
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  last_modified_by?: string;
  last_modified_at?: string;
  github_pr_url?: string;
  github_file_path?: string;
}

export default function KPIDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug]);

  async function loadData() {
    setLoading(true);
    
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      const userName = currentUser?.user_metadata?.user_name || currentUser?.email;

      const { data, error } = await supabase
        .from('kpis')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error loading KPI:', error);
        setKpi(null);
        return;
      }

      // Normalize data - ensure arrays are arrays, handle JSON strings
      const normalizedData = {
        ...data,
        industry: Array.isArray(data.industry) 
          ? data.industry 
          : typeof data.industry === 'string' 
            ? (data.industry.includes('[') ? JSON.parse(data.industry) : [data.industry])
            : [],
        tags: Array.isArray(data.tags) 
          ? data.tags 
          : typeof data.tags === 'string' 
            ? (data.tags.includes('[') ? JSON.parse(data.tags) : [data.tags])
            : [],
      };
      
      setKpi(normalizedData as KPI);
      
      // Check if user can edit
      if (userName && normalizedData) {
        setCanEdit(normalizedData.created_by === userName || normalizedData.status === 'draft');
      }
    } catch (err) {
      console.error('Error:', err);
      setKpi(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading KPI...</p>
      </main>
    );
  }

  if (!kpi) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>KPI Not Found</h1>
        <p>The KPI you're looking for doesn't exist.</p>
        <Link href="/kpis" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to KPIs
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '100%', margin: '0 auto', padding: '2rem 1rem', overflowX: 'hidden' }}>
      {/* Three Column Layout: Left Sidebar | Main Content | Right TOC */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'minmax(200px, 250px) minmax(0, 1fr) minmax(200px, 280px)', 
        gap: '1.5rem',
        width: '100%',
        maxWidth: '100%',
      }}>
        {/* Left Sidebar - Full Height, All KPIs Navigation */}
        <Sidebar section="kpis" />

        {/* Main Content - Middle Column */}
        <article style={{ minWidth: 0, overflowWrap: 'break-word', wordWrap: 'break-word' }}>
          {/* Return Button and Header */}
          <div style={{
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--ifm-color-emphasis-200)',
          }}>
            <Link
              href="/kpis"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'var(--ifm-color-primary)',
                textDecoration: 'none',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              ← Back to KPIs
            </Link>
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {kpi.name}
                  {kpi.status === 'draft' && (
                    <span style={{
                      marginLeft: '0.75rem',
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#fbbf24',
                      color: '#78350f',
                      borderRadius: '4px',
                      fontWeight: '500',
                    }}>
                      Draft
                    </span>
                  )}
                </h1>
                {kpi.description && (
                  <p style={{ fontSize: '1.125rem', color: 'var(--ifm-color-emphasis-600)', lineHeight: '1.6' }}>
                    {kpi.description}
                  </p>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {kpi && (
                  <>
                    <LikeButton itemType="kpi" itemId={kpi.id} itemSlug={kpi.slug} />
                    <AddToAnalysisButton
                      itemType="kpi"
                      itemId={kpi.id}
                      itemSlug={kpi.slug}
                      itemName={kpi.name}
                    />
                  </>
                )}
                {canEdit && (
                  <Link
                    href={`/kpis/${slug}/edit`}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'var(--ifm-color-primary)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>
          {/* Basic Information */}
          <section id="basic-info" style={{ marginBottom: '3rem' }}>
            <h2 id="basic-information" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Basic Information
            </h2>
            <div style={{
              backgroundColor: 'var(--ifm-color-emphasis-50)',
              borderRadius: '12px',
              padding: '2rem',
            }}>
              {kpi.formula && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Formula
                  </h3>
                  <div style={{ position: 'relative' }}>
                    <CodeBlockToolbar 
                      code={kpi.formula} 
                      language="text"
                      blockId="formula"
                      onEdit={canEdit ? () => router.push(`/kpis/${slug}/edit`) : undefined}
                    />
                    <code style={{
                      display: 'block',
                      padding: '1rem',
                      backgroundColor: 'var(--ifm-background-color)',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontFamily: 'monospace',
                      position: 'relative',
                    }}>
                      {kpi.formula}
                    </code>
                  </div>
                </div>
              )}
              
              {kpi.category && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ marginRight: '0.5rem' }}>Category:</strong>
                  {kpi.category}
                </div>
              )}
              
              {kpi.tags && (
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ marginRight: '0.5rem' }}>Tags:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                    {(Array.isArray(kpi.tags) ? kpi.tags : [kpi.tags]).filter(Boolean).map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'var(--ifm-color-primary)',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Business Context */}
          {(kpi.industry || kpi.priority || kpi.core_area || kpi.scope) && (
            <section id="business-context" style={{ marginBottom: '3rem' }}>
              <h2 id="business-context" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Business Context
              </h2>
              <div style={{
                backgroundColor: 'var(--ifm-color-emphasis-50)',
                borderRadius: '12px',
                padding: '2rem',
              }}>
                {kpi.industry && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Industry:</strong>{' '}
                    {Array.isArray(kpi.industry) 
                      ? kpi.industry.join(', ') 
                      : kpi.industry}
                  </div>
                )}
                {kpi.priority && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Priority:</strong> {kpi.priority}
                  </div>
                )}
                {kpi.core_area && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Core Area:</strong> {kpi.core_area}
                  </div>
                )}
                {kpi.scope && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Scope:</strong> {kpi.scope}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Technical Details */}
          {(kpi.kpi_type || kpi.metric || kpi.aggregation_window) && (
            <section id="technical" style={{ marginBottom: '3rem' }}>
              <h2 id="technical-details" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Technical Details
              </h2>
              <div style={{
                backgroundColor: 'var(--ifm-color-emphasis-50)',
                borderRadius: '12px',
                padding: '2rem',
              }}>
                {kpi.kpi_type && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>KPI Type:</strong> {kpi.kpi_type}
                  </div>
                )}
                {kpi.metric && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Metric:</strong> {kpi.metric}
                  </div>
                )}
                {kpi.aggregation_window && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Aggregation Window:</strong> {kpi.aggregation_window}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Platform Implementation */}
          {(kpi.ga4_implementation || kpi.adobe_implementation || kpi.amplitude_implementation) && (
            <section id="platform" style={{ marginBottom: '3rem' }}>
              <h2 id="platform-implementation" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Platform Implementation
              </h2>
              <div style={{
                backgroundColor: 'var(--ifm-color-emphasis-50)',
                borderRadius: '12px',
                padding: '2rem',
              }}>
                {kpi.ga4_implementation && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>GA4</h3>
                    <div style={{ position: 'relative' }}>
                      <CodeBlockToolbar 
                        code={kpi.ga4_implementation} 
                        language="json"
                        blockId="ga4-implementation"
                        onEdit={canEdit ? () => router.push(`/kpis/${slug}/edit`) : undefined}
                      />
                      <pre style={{
                        padding: '1rem',
                        backgroundColor: 'var(--ifm-background-color)',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        position: 'relative',
                      }}>
                        {kpi.ga4_implementation}
                      </pre>
                    </div>
                  </div>
                )}
                {kpi.adobe_implementation && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Adobe Analytics</h3>
                    <div style={{ position: 'relative' }}>
                      <CodeBlockToolbar 
                        code={kpi.adobe_implementation} 
                        language="json"
                        blockId="adobe-implementation"
                        onEdit={canEdit ? () => router.push(`/kpis/${slug}/edit`) : undefined}
                      />
                      <pre style={{
                        padding: '1rem',
                        backgroundColor: 'var(--ifm-background-color)',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        position: 'relative',
                      }}>
                        {kpi.adobe_implementation}
                      </pre>
                    </div>
                  </div>
                )}
                {kpi.amplitude_implementation && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Amplitude</h3>
                    <div style={{ position: 'relative' }}>
                      <CodeBlockToolbar 
                        code={kpi.amplitude_implementation} 
                        language="json"
                        blockId="amplitude-implementation"
                        onEdit={canEdit ? () => router.push(`/kpis/${slug}/edit`) : undefined}
                      />
                      <pre style={{
                        padding: '1rem',
                        backgroundColor: 'var(--ifm-background-color)',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        position: 'relative',
                      }}>
                        {kpi.amplitude_implementation}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Data Mappings */}
          {(kpi.data_layer_mapping || kpi.xdm_mapping) && (
            <section id="data-mappings" style={{ marginBottom: '3rem' }}>
              <h2 id="data-mappings" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Data Mappings
              </h2>
              <div style={{
                backgroundColor: 'var(--ifm-color-emphasis-50)',
                borderRadius: '12px',
                padding: '2rem',
              }}>
                {kpi.data_layer_mapping && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Data Layer Mapping</h3>
                    <div style={{ position: 'relative' }}>
                      <CodeBlockToolbar 
                        code={kpi.data_layer_mapping} 
                        language="json"
                        blockId="data-layer-mapping"
                        onEdit={canEdit ? () => router.push(`/kpis/${slug}/edit`) : undefined}
                      />
                      <pre style={{
                        padding: '1rem',
                        backgroundColor: 'var(--ifm-background-color)',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        position: 'relative',
                      }}>
                        {kpi.data_layer_mapping}
                      </pre>
                    </div>
                  </div>
                )}
                {kpi.xdm_mapping && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>XDM Mapping</h3>
                    <div style={{ position: 'relative' }}>
                      <CodeBlockToolbar 
                        code={kpi.xdm_mapping} 
                        language="json"
                        blockId="xdm-mapping"
                        onEdit={canEdit ? () => router.push(`/kpis/${slug}/edit`) : undefined}
                      />
                      <pre style={{
                        padding: '1rem',
                        backgroundColor: 'var(--ifm-background-color)',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        position: 'relative',
                      }}>
                        {kpi.xdm_mapping}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* SQL Examples */}
          {kpi.sql_query && (
            <section id="sql" style={{ marginBottom: '3rem' }}>
              <h2 id="sql-examples" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                SQL Examples
              </h2>
              <div style={{
                backgroundColor: 'var(--ifm-color-emphasis-50)',
                borderRadius: '12px',
                padding: '2rem',
              }}>
                <div style={{ position: 'relative' }}>
                  <CodeBlockToolbar 
                    code={kpi.sql_query} 
                    language="sql"
                    blockId="sql-query"
                    onEdit={canEdit ? () => router.push(`/kpis/${slug}/edit`) : undefined}
                  />
                  <pre style={{
                    padding: '1rem',
                    backgroundColor: 'var(--ifm-background-color)',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    position: 'relative',
                  }}>
                    {kpi.sql_query}
                  </pre>
                </div>
              </div>
            </section>
          )}

          {/* Documentation */}
          {(kpi.calculation_notes || kpi.details) && (
            <section id="documentation" style={{ marginBottom: '3rem' }}>
              <h2 id="documentation" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                Documentation
              </h2>
              <div style={{
                backgroundColor: 'var(--ifm-color-emphasis-50)',
                borderRadius: '12px',
                padding: '2rem',
              }}>
                {kpi.calculation_notes && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Calculation Notes</h3>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {kpi.calculation_notes}
                    </div>
                  </div>
                )}
                {kpi.details && (
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>Details</h3>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {kpi.details}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Governance */}
          <section id="governance" style={{ marginBottom: '3rem' }}>
            <h2 id="governance" style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              Governance
            </h2>
            <div style={{
              backgroundColor: 'var(--ifm-color-emphasis-50)',
              borderRadius: '12px',
              padding: '2rem',
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Status:</strong> {kpi.status}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Created by:</strong> {kpi.created_by}
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Created at:</strong> {new Date(kpi.created_at).toLocaleDateString()}
              </div>
              {kpi.last_modified_by && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Last modified by:</strong> {kpi.last_modified_by}
                </div>
              )}
              {kpi.last_modified_at && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Last modified at:</strong> {new Date(kpi.last_modified_at).toLocaleDateString()}
                </div>
              )}
              {kpi.github_pr_url && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>GitHub PR:</strong>{' '}
                  <a href={kpi.github_pr_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ifm-color-primary)' }}>
                    View Pull Request
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Giscus Comments */}
          <div style={{ marginTop: '3rem' }}>
            <GiscusComments term={slug} category="kpis" />
          </div>
        </article>

        {/* Right Rail TOC - Auto-generated from page headings */}
        <TableOfContents />
      </div>
    </main>
  );
}

