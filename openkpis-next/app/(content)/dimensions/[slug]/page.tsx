import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import TableOfContents from '@/components/TableOfContents';
import GiscusComments from '@/components/GiscusComments';
import CodeBlockToolbar from '@/components/CodeBlockToolbar';
import LikeButton from '@/components/LikeButton';
import { STATUS } from '@/lib/supabase/auth';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { fetchDimensionBySlug, type NormalizedDimension } from '@/lib/server/dimensions';

type Heading = {
  id: string;
  text: string;
  level: number;
};

function renderDetailRow(label: string, value: string | null | undefined, key: string): JSX.Element | null {
  if (!value) return null;
  return (
    <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ifm-color-emphasis-500)' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.95rem', color: 'var(--ifm-color-emphasis-800)' }}>{value}</span>
    </div>
  );
}

function renderTokenPills(label: string, items: string[]) {
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ifm-color-emphasis-500)' }}>
        {label}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {items.map((item) => (
          <span
            key={item}
            style={{
              backgroundColor: 'var(--ifm-color-emphasis-100)',
              color: 'var(--ifm-color-emphasis-800)',
              padding: '0.25rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function buildEventsTable(ga4Event?: string | null, adobeEvent?: string | null): Array<{ platform: string; events: string[] }> {
  const platformMap = new Map<string, string[]>();
  
  // Process GA4 events
  if (ga4Event) {
    const ga4Values = ga4Event
      .split(/\r?\n/)
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    if (ga4Values.length > 0) {
      platformMap.set('Google Analytics 4', ga4Values);
    }
  }
  
  // Process Adobe events
  if (adobeEvent) {
    const adobeValues = adobeEvent
      .split(/\r?\n/)
      .map(v => v.trim())
      .filter(v => v.length > 0);
    
    if (adobeValues.length > 0) {
      platformMap.set('Adobe', adobeValues);
    }
  }
  
  // Convert map to array of objects
  return Array.from(platformMap.entries()).map(([platform, events]) => ({
    platform,
    events,
  }));
}

function renderEventsTable(ga4Event?: string | null, adobeEvent?: string | null) {
  const rows = buildEventsTable(ga4Event, adobeEvent);
  
  if (!rows.length) return null;
  
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.875rem',
        }}
      >
        <thead>
          <tr style={{ borderBottom: '2px solid var(--ifm-color-emphasis-300)' }}>
            <th
              style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontWeight: 600,
                color: 'var(--ifm-color-emphasis-700)',
                backgroundColor: 'var(--ifm-color-emphasis-50)',
              }}
            >
              Platform
            </th>
            <th
              style={{
                padding: '0.75rem',
                textAlign: 'left',
                fontWeight: 600,
                color: 'var(--ifm-color-emphasis-700)',
                backgroundColor: 'var(--ifm-color-emphasis-50)',
              }}
            >
              Event
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={index}
              style={{
                borderBottom: '1px solid var(--ifm-color-emphasis-200)',
              }}
            >
              <td
                style={{
                  padding: '0.75rem',
                  color: 'var(--ifm-color-emphasis-800)',
                  verticalAlign: 'top',
                }}
              >
                {row.platform}
              </td>
              <td
                style={{
                  padding: '0.75rem',
                  fontFamily: 'var(--ifm-font-family-monospace)',
                  color: 'var(--ifm-color-emphasis-800)',
                  whiteSpace: 'pre-line',
                }}
              >
                {row.events.join('\n')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderRichTextBlock(id: string, title: string, content?: string | null) {
  if (!content) return null;
  return (
    <section id={id} style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h2>
      <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap', color: 'var(--ifm-color-emphasis-700)' }}>{content}</p>
    </section>
  );
}

// Some legacy dimensions have SQL stored as a JSON array of strings with <br> tags
// and an initial "sql" marker. Normalize that into clean multiline SQL text.
function normalizeSqlQuery(raw?: string | null): string | null {
  if (!raw) return null;
  let text = raw;

  // Try to parse JSON array form: ["sql<br>...", "<br> ..."]
  try {
    const trimmed = text.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        text = parsed.join('');
      }
    }
  } catch {
    // ignore JSON parse errors and fall back to raw string
  }

  // Replace HTML <br> tags with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip a leading "sql" marker if present (e.g. "sql\nSELECT..." or "sqlSELECT")
  text = text.replace(/^\s*sql\s*/i, '');

  return text;
}

// Some legacy dimensions have JSON mappings stored with <br> tags, optional "json" markers,
// or even as JSON arrays of string fragments. Normalize into pretty-printed JSON.
function normalizeJsonMapping(raw?: string | null): string | null {
  if (!raw) return null;
  let text = raw;

  // Try to parse JSON if it looks like JSON
  try {
    const trimmed = text.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      const parsed = JSON.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    }
  } catch {
    // ignore parse errors and fall back to string normalization
  }

  // Replace HTML <br> tags with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Strip a leading "json" marker if present
  text = text.replace(/^\s*json\s*/i, '');

  return text;
}

function renderCodeBlock(id: string, title: string, code?: string | null, language?: string) {
  if (!code) return null;
  return (
    <section id={id} style={{ marginBottom: '2rem' }}>
      {title && <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>{title}</h2>}
      <div style={{ position: 'relative', background: 'var(--ifm-color-emphasis-50)', borderRadius: '8px', overflow: 'hidden' }}>
        <pre
          id={id}
          style={{
            margin: 0,
            padding: '1.25rem',
            overflowX: 'auto',
            fontFamily: 'var(--ifm-font-family-monospace)',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            background: 'var(--ifm-color-emphasis-50)',
          }}
        >
          <code className={language ? `language-${language}` : undefined}>{code}</code>
        </pre>
        <CodeBlockToolbar code={code} language={language} blockId={id} />
      </div>
    </section>
  );
}

function buildHeadings(dimension: NormalizedDimension): Heading[] {
  const headings: Heading[] = [
    { id: 'overview', text: 'Overview', level: 2 },
  ];

  if (dimension.formula) headings.push({ id: 'formula', text: 'Formula', level: 2 });
  if (dimension.business_use_case) headings.push({ id: 'business-use-case', text: 'Business Use Case', level: 2 });
  if (dimension.ga4_event) headings.push({ id: 'ga4-event', text: 'GA4 Event', level: 2 });
  if (dimension.adobe_event) headings.push({ id: 'adobe-event', text: 'Adobe Event', level: 2 });
  if (dimension.w3_data_layer) headings.push({ id: 'w3-data-layer', text: 'W3 Data Layer', level: 2 });
  if (dimension.ga4_data_layer) headings.push({ id: 'ga4-data-layer', text: 'GA4 Data Layer', level: 2 });
  if (dimension.adobe_client_data_layer) headings.push({ id: 'adobe-client-data-layer', text: 'Adobe Client Data Layer', level: 2 });
  if (dimension.xdm_mapping) headings.push({ id: 'xdm-mapping', text: 'XDM Mapping', level: 2 });
  if (dimension.sql_query) headings.push({ id: 'sql-query', text: 'SQL Query', level: 2 });
  if (dimension.calculation_notes) headings.push({ id: 'calculation-notes', text: 'Calculation Notes', level: 2 });
  if (dimension.data_sensitivity || dimension.pii_flag) headings.push({ id: 'governance', text: 'Governance', level: 2 });

  return headings;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DimensionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use regular client (not admin) - RLS policies handle access control
  const dimension = await fetchDimensionBySlug(supabase, slug);

  if (!dimension) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Dimension Not Found</h1>
        <p>The Dimension you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <Link href="/dimensions" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Dimensions
        </Link>
      </main>
    );
  }

  const identifiers = collectUserIdentifiers(user);
  const isOwner = dimension.created_by ? identifiers.includes(dimension.created_by) : false;
  const isVisible = dimension.status === STATUS.PUBLISHED || isOwner;

  if (!isVisible) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Dimension Not Available</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          This Dimension is currently in draft. Sign in with the owner account to view it.
        </p>
        <Link href="/dimensions" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Dimensions
        </Link>
      </main>
    );
  }

  const canEdit = isOwner && dimension.status === STATUS.DRAFT;
  const headings = buildHeadings(dimension);

  return (
    <main className="page-main">
      <div className="page-grid-3col">
        <Sidebar section="dimensions" />

        <article className="detail-article">
          <div className="detail-header">
            <Link href="/dimensions" className="detail-back-link">
              ← Back to Dimensions
            </Link>
            <div className="detail-header-row">
              <div style={{ flex: 1 }}>
                <h1 className="detail-title">
                  {dimension.name}
                  {dimension.status === STATUS.DRAFT && (
                    <span className="badge-draft">Draft</span>
                  )}
                </h1>
                {dimension.description && (
                  <p className="detail-description">{dimension.description}</p>
                )}
              </div>

              <div className="detail-header-actions">
                <LikeButton itemType="dimension" itemId={dimension.id} itemSlug={dimension.slug} />
                {canEdit && (
                  <Link
                    href={`/dimensions/${dimension.slug}/edit`}
                    className="btn btn-primary"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          </div>

          {renderRichTextBlock('business-use-case', 'Business Use Case', dimension.business_use_case)}
          {renderRichTextBlock('Priority', 'Importance of Dimension', dimension.priority)}
          {renderRichTextBlock('Core area', 'Core area of Dimension Analysis', dimension.core_area ?? undefined)}
          {renderRichTextBlock('Scope', 'Scope at which Dimension is analyzed', dimension.scope ?? undefined)}
          {renderDetailRow('Industry', dimension.industry, 'industry')}

          {renderCodeBlock('formula', 'Formula', dimension.formula, 'text')}
          {renderCodeBlock('sql-query', 'SQL Query', normalizeSqlQuery(dimension.sql_query), 'sql')}
          {renderRichTextBlock('calculation-notes', 'Calculation Notes', dimension.calculation_notes)}
          
          {/* Technical Details Section */}
          {(dimension.data_type || dimension.aggregation_window) && (
            <section id="technical-details" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Technical Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {renderDetailRow('Data Type', dimension.data_type, 'data-type')}
                {renderDetailRow('Aggregation Window', dimension.aggregation_window, 'aggregation-window')}
              </div>
            </section>
          )}

          <section id="overview" className="section" style={{ lineHeight: '2', marginBottom: '2rem' }}>
            <h2 className="section-title">Events</h2>
            {renderEventsTable(dimension.ga4_event, dimension.adobe_event)}
          </section>

          {/* Data Mappings Accordion */}
          {(dimension.w3_data_layer || dimension.ga4_data_layer || dimension.adobe_client_data_layer || dimension.xdm_mapping) && (
            <section id="data-mappings" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Data Mappings</h2>
              
              {dimension.w3_data_layer && (
                <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>W3 Data Layer</summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderCodeBlock('w3-data-layer', '', normalizeJsonMapping(dimension.w3_data_layer), 'json')}
                  </div>
                </details>
              )}
              
              {dimension.ga4_data_layer && (
                <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>GA4 Data Layer</summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderCodeBlock('ga4-data-layer', '', normalizeJsonMapping(dimension.ga4_data_layer), 'json')}
                  </div>
                </details>
              )}
              
              {dimension.adobe_client_data_layer && (
                <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>Adobe Client Data Layer</summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderCodeBlock('adobe-client-data-layer', '', normalizeJsonMapping(dimension.adobe_client_data_layer), 'json')}
                  </div>
                </details>
              )}
              
              {dimension.xdm_mapping && (
                <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>XDM Mapping</summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderCodeBlock('xdm-mapping', '', normalizeJsonMapping(dimension.xdm_mapping), 'json')}
                  </div>
                </details>
              )}
            </section>
          )}

          {/* Source Data Section */}
          {dimension.source_data && (
            <section id="source-data" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Source Data</h2>
              {renderRichTextBlock('source-data', '', dimension.source_data)}
            </section>
          )}

          {/* Dependencies Section */}
          {dimension.dependencies && (() => {
            try {
              const deps = typeof dimension.dependencies === 'string' ? JSON.parse(dimension.dependencies) : dimension.dependencies;
              if (typeof deps === 'object' && deps !== null) {
                const hasAnyDeps = (deps.Events && deps.Events.length > 0) ||
                  (deps.Metrics && deps.Metrics.length > 0) ||
                  (deps.Dimensions && deps.Dimensions.length > 0) ||
                  (deps.KPIs && deps.KPIs.length > 0);
                
                if (hasAnyDeps) {
                  return (
                    <section id="dependencies" style={{ marginBottom: '2rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Dependencies</h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--ifm-color-emphasis-600)', marginBottom: '1rem', fontStyle: 'italic' }}>
                        Prerequisite: List the dependencies required for this Dimension
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', backgroundColor: 'var(--ifm-color-emphasis-50)' }}>
                        {deps.Events && deps.Events.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              Events:
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {deps.Events.map((event: string) => (
                                <span
                                  key={event}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: 'var(--ifm-color-primary)',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {event}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {deps.Metrics && deps.Metrics.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              Metrics:
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {deps.Metrics.map((metricSlug: string) => (
                                <Link
                                  key={metricSlug}
                                  href={`/metrics/${metricSlug}`}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: 'var(--ifm-color-primary)',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                  }}
                                >
                                  {metricSlug}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {deps.Dimensions && deps.Dimensions.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              Dimensions:
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {deps.Dimensions.map((dimSlug: string) => (
                                <Link
                                  key={dimSlug}
                                  href={`/dimensions/${dimSlug}`}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: 'var(--ifm-color-primary)',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                  }}
                                >
                                  {dimSlug}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                        {deps.KPIs && deps.KPIs.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              KPIs:
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {deps.KPIs.map((kpiSlug: string) => (
                                <Link
                                  key={kpiSlug}
                                  href={`/kpis/${kpiSlug}`}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: 'var(--ifm-color-primary)',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                  }}
                                >
                                  {kpiSlug}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                }
              }
            } catch {
              // If not valid JSON, fall back to plain text display
            }
            return (
              <section id="dependencies" style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Dependencies</h2>
                {renderRichTextBlock('dependencies', '', dimension.dependencies)}
              </section>
            );
          })()}

          {/* Report Attributes Section */}
          {dimension.report_attributes && (
            <section id="report-attributes" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Report Attributes</h2>
              {renderRichTextBlock('report-attributes', '', dimension.report_attributes)}
            </section>
          )}

          {/* Dashboard Usage Section */}
          {dimension.dashboard_usage && Array.isArray(dimension.dashboard_usage) && dimension.dashboard_usage.length > 0 && (
            <section id="dashboard-usage" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Dashboard Usage</h2>
              {renderTokenPills('Dashboards', dimension.dashboard_usage)}
            </section>
          )}

          {/* Segment Eligibility Section */}
          {dimension.segment_eligibility && (
            <section id="segment-eligibility" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Segment Eligibility</h2>
              {renderRichTextBlock('segment-eligibility', '', dimension.segment_eligibility)}
            </section>
          )}

          {/* Governance Section */}
          {(dimension.data_sensitivity || dimension.pii_flag) && (
            <section id="governance" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Governance</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {renderDetailRow('Data Sensitivity', dimension.data_sensitivity, 'data-sensitivity')}
                {dimension.pii_flag && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ifm-color-emphasis-500)' }}>
                      Contains PII
                    </span>
                    <span style={{ fontSize: '0.95rem', color: 'var(--ifm-color-emphasis-800)' }}>
                      Yes - This Dimension contains Personally Identifiable Information
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Related Dimensions Section */}
          {dimension.related_dimensions && Array.isArray(dimension.related_dimensions) && dimension.related_dimensions.length > 0 && (
            <section id="related-dimensions" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Related Dimensions</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {dimension.related_dimensions.map((relatedSlug) => (
                  <Link
                    key={relatedSlug}
                    href={`/dimensions/${relatedSlug}`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--ifm-color-primary)',
                      color: '#fff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    {relatedSlug}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Derived Dimensions Section */}
          {dimension.derived_dimensions && Array.isArray(dimension.derived_dimensions) && dimension.derived_dimensions.length > 0 && (
            <section id="derived-dimensions" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Derived Dimensions</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {dimension.derived_dimensions.map((dimSlug) => (
                  <Link
                    key={dimSlug}
                    href={`/dimensions/${dimSlug}`}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: 'var(--ifm-color-primary)',
                      color: '#fff',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    {dimSlug}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section id="overview" className="section" style={{ lineHeight: '2', marginBottom: '2rem' }}>
            <h2 className="section-title">Governance</h2>
            {renderDetailRow('Created by', dimension.created_by, 'created-by')}
            {renderDetailRow('Created on', dimension.created_at ? new Date(dimension.created_at).toLocaleDateString() : null, 'created-on')}
            {renderDetailRow('Last modified by', dimension.last_modified_by ?? undefined, 'last-modified-by')}
            {renderDetailRow('Last modified on', dimension.last_modified_at ? new Date(dimension.last_modified_at).toLocaleDateString() : null, 'last-modified-on')}
            {renderDetailRow('Status', dimension.status ? dimension.status.toUpperCase() : null, 'status')}
          </section>

          {dimension.github_pr_url && (
            <section id="github" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>GitHub</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href={dimension.github_pr_url} target="_blank" rel="noreferrer" style={{ color: 'var(--ifm-color-primary)' }}>
                  View related Pull Request
                </Link>
                {dimension.github_file_path && (
                  <code style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)' }}>{dimension.github_file_path}</code>
                )}
              </div>
            </section>
          )}

          <section id="discussion" style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Community Discussion</h2>
            <GiscusComments category="dimensions" term={dimension.slug} />
          </section>
        </article>

        <TableOfContents headings={headings} />
      </div>
    </main>
  );
}
