import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import TableOfContents from '@/components/TableOfContents';
import GiscusComments from '@/components/GiscusComments';
import CodeBlockToolbar from '@/components/CodeBlockToolbar';
import LikeButton from '@/components/LikeButton';
import EditPublishedButton from '@/components/EditPublishedButton';
import { STATUS } from '@/lib/supabase/auth';
import { collectUserIdentifiers } from '@/lib/server/entities';
import { fetchEventBySlug, type NormalizedEvent } from '@/lib/server/events';

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

// Some legacy events have JSON mappings stored with <br> tags, optional "json" markers,
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

function buildHeadings(event: NormalizedEvent): Heading[] {
  const headings: Heading[] = [
    { id: 'overview', text: 'Overview', level: 2 },
  ];

  if (event.event_serialization) headings.push({ id: 'event-serialization', text: 'Event Serialization', level: 2 });
  if (event.business_use_case) headings.push({ id: 'business-use-case', text: 'Business Use Case', level: 2 });
  if (event.ga4_event) headings.push({ id: 'ga4-event', text: 'GA4 Event', level: 2 });
  if (event.adobe_event) headings.push({ id: 'adobe-event', text: 'Adobe Event', level: 2 });
  if (event.w3_data_layer) headings.push({ id: 'w3-data-layer', text: 'W3 Data Layer', level: 2 });
  if (event.ga4_data_layer) headings.push({ id: 'ga4-data-layer', text: 'GA4 Data Layer', level: 2 });
  if (event.adobe_client_data_layer) headings.push({ id: 'adobe-client-data-layer', text: 'Adobe Client Data Layer', level: 2 });
  if (event.xdm_mapping) headings.push({ id: 'xdm-mapping', text: 'XDM Mapping', level: 2 });
  if (event.parameters) headings.push({ id: 'parameters', text: 'Parameters', level: 2 });
  if (event.calculation_notes) headings.push({ id: 'calculation-notes', text: 'Calculation Notes', level: 2 });
  if (event.data_sensitivity || event.pii_flag) headings.push({ id: 'governance', text: 'Governance', level: 2 });

  return headings;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Use regular client (not admin) - RLS policies handle access control
  const event = await fetchEventBySlug(supabase, slug);

  if (!event) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Event Not Found</h1>
        <p>The Event you&rsquo;re looking for doesn&rsquo;t exist.</p>
        <Link href="/events" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Events
        </Link>
      </main>
    );
  }

  const identifiers = collectUserIdentifiers(user);
  const isOwner = event.created_by ? identifiers.includes(event.created_by) : false;
  const isVisible = event.status === STATUS.PUBLISHED || isOwner;

  if (!isVisible) {
    return (
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Event Not Available</h1>
        <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>
          This Event is currently in draft. Sign in with the owner account to view it.
        </p>
        <Link href="/events" style={{ color: 'var(--ifm-color-primary)' }}>
          ← Back to Events
        </Link>
      </main>
    );
  }

  const canEdit = isOwner && event.status === STATUS.DRAFT;
  const headings = buildHeadings(event);

  return (
    <main className="page-main">
      <div className="page-grid-3col">
        <Sidebar section="events" />

        <article className="detail-article">
          <div className="detail-header">
            <Link href="/events" className="detail-back-link">
              ← Back to Events
            </Link>
            <div className="detail-header-row">
              <div style={{ flex: 1 }}>
                <h1 className="detail-title">
                  {event.name}
                  {event.status === STATUS.DRAFT && (
                    <span className="badge-draft">Draft</span>
                  )}
                </h1>
                {event.description && (
                  <p className="detail-description">{event.description}</p>
                )}
                <div className="detail-tags">
                  {event.category ? (
                    <span className="badge badge-category">
                      {event.category}
                    </span>
                  ) : null}
                  {event.tags.map((tag) => (
                    <span key={tag} className="badge badge-tag">
                      {tag}
                    </span>
                  ))}
                  {event.industry && (
                    <span className="badge badge-industry">
                      {event.industry}
                    </span>
                  )}
                </div>
              </div>

              <div className="detail-header-actions">
                <LikeButton itemType="event" itemId={event.id} itemSlug={event.slug} />
                {canEdit ? (
                  <Link
                    href={`/events/${event.slug}/edit`}
                    className="btn btn-primary"
                  >
                    Edit
                  </Link>
                ) : event.status === STATUS.PUBLISHED ? (
                  <EditPublishedButton itemType="event" itemId={event.id} itemSlug={event.slug} />
                ) : null}
              </div>
            </div>
          </div>

          {renderCodeBlock('event-serialization', 'Event Serialization', event.event_serialization, 'text')}
          {renderRichTextBlock('business-use-case', 'Business Use Case', event.business_use_case)}
          {renderDetailRow('Priority', event.priority, 'priority')}
          {renderDetailRow('Core area', event.core_area, 'core-area')}
          {renderDetailRow('Scope', event.scope, 'scope')}

          {renderRichTextBlock('calculation-notes', 'Calculation Notes', event.calculation_notes)}
          
          {/* Technical Details Section */}
          {(event.event_type || event.aggregation_window) && (
            <section id="technical-details" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Technical Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {renderDetailRow('Event Type', event.event_type, 'event-type')}
                {renderDetailRow('Aggregation Window', event.aggregation_window, 'aggregation-window')}
              </div>
            </section>
          )}

          <section id="events" className="section" style={{ lineHeight: '2', marginBottom: '2rem' }}>
            <h2 className="section-title">Platform Events</h2>
            {renderEventsTable(event.ga4_event, event.adobe_event)}
          </section>

          {/* Data Mappings Accordion */}
          {(event.w3_data_layer || event.ga4_data_layer || event.adobe_client_data_layer || event.xdm_mapping || event.parameters) && (
            <section id="data-mappings" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Data Mappings</h2>
              
              {event.w3_data_layer && (
                <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>W3 Data Layer</summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderCodeBlock('w3-data-layer', '', normalizeJsonMapping(event.w3_data_layer), 'json')}
                  </div>
                </details>
              )}
              
              {event.ga4_data_layer && (
                <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>GA4 Data Layer</summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderCodeBlock('ga4-data-layer', '', normalizeJsonMapping(event.ga4_data_layer), 'json')}
                  </div>
                </details>
              )}
              
              {event.adobe_client_data_layer && (
                <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>Adobe Client Data Layer</summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderCodeBlock('adobe-client-data-layer', '', normalizeJsonMapping(event.adobe_client_data_layer), 'json')}
                  </div>
                </details>
              )}
              
              {event.xdm_mapping && (
                <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>XDM Mapping</summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderCodeBlock('xdm-mapping', '', normalizeJsonMapping(event.xdm_mapping), 'json')}
                  </div>
                </details>
              )}
              
              {event.parameters && (
                <details style={{ marginBottom: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', padding: '1rem' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '0.5rem' }}>Parameters</summary>
                  <div style={{ marginTop: '0.5rem' }}>
                    {renderCodeBlock('parameters', '', normalizeJsonMapping(event.parameters), 'json')}
                  </div>
                </details>
              )}
            </section>
          )}

          {/* Source Data Section */}
          {event.source_data && (
            <section id="source-data" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Source Data</h2>
              {renderRichTextBlock('source-data', '', event.source_data)}
            </section>
          )}

          {/* Dependencies Section */}
          {event.dependencies && (() => {
            try {
              const deps = typeof event.dependencies === 'string' ? JSON.parse(event.dependencies) : event.dependencies;
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
                        Prerequisite: List the dependencies required for this Event
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: '8px', backgroundColor: 'var(--ifm-color-emphasis-50)' }}>
                        {deps.Events && deps.Events.length > 0 && (
                          <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-700)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                              Events:
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {deps.Events.map((eventSlug: string) => (
                                <Link
                                  key={eventSlug}
                                  href={`/events/${eventSlug}`}
                                  style={{
                                    padding: '0.25rem 0.75rem',
                                    backgroundColor: 'var(--ifm-color-primary)',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem',
                                    textDecoration: 'none',
                                  }}
                                >
                                  {eventSlug}
                                </Link>
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
                {renderRichTextBlock('dependencies', '', event.dependencies)}
              </section>
            );
          })()}

          {/* Report Attributes Section */}
          {event.report_attributes && (
            <section id="report-attributes" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Report Attributes</h2>
              {renderRichTextBlock('report-attributes', '', event.report_attributes)}
            </section>
          )}

          {/* Dashboard Usage Section */}
          {event.dashboard_usage && Array.isArray(event.dashboard_usage) && event.dashboard_usage.length > 0 && (
            <section id="dashboard-usage" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Dashboard Usage</h2>
              {renderTokenPills('Dashboards', event.dashboard_usage)}
            </section>
          )}

          {/* Segment Eligibility Section */}
          {event.segment_eligibility && (
            <section id="segment-eligibility" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Segment Eligibility</h2>
              {renderRichTextBlock('segment-eligibility', '', event.segment_eligibility)}
            </section>
          )}

          {/* Governance Section */}
          {(event.data_sensitivity || event.pii_flag) && (
            <section id="governance" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Governance</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {renderDetailRow('Data Sensitivity', event.data_sensitivity, 'data-sensitivity')}
                {event.pii_flag && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ifm-color-emphasis-500)' }}>
                      Contains PII
                    </span>
                    <span style={{ fontSize: '0.95rem', color: 'var(--ifm-color-emphasis-800)' }}>
                      Yes - This Event contains Personally Identifiable Information
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Related & Derived Dimensions Section - Grouped together */}
          {(event.related_dimensions && Array.isArray(event.related_dimensions) && event.related_dimensions.length > 0) ||
           (event.derived_dimensions && Array.isArray(event.derived_dimensions) && event.derived_dimensions.length > 0) ? (
            <section id="dimensions" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Dimensions</h2>
              {event.related_dimensions && Array.isArray(event.related_dimensions) && event.related_dimensions.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-700)' }}>Related Dimensions</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {event.related_dimensions.map((relatedSlug) => (
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
                </div>
              )}
              {event.derived_dimensions && Array.isArray(event.derived_dimensions) && event.derived_dimensions.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-700)' }}>Derived Dimensions</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {event.derived_dimensions.map((derivedSlug) => (
                      <Link
                        key={derivedSlug}
                        href={`/dimensions/${derivedSlug}`}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'var(--ifm-color-primary)',
                          color: '#fff',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                        }}
                      >
                        {derivedSlug}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ) : null}

          {/* Derived Metrics & KPIs Section - Grouped together */}
          {(event.derived_metrics && Array.isArray(event.derived_metrics) && event.derived_metrics.length > 0) ||
           (event.derived_kpis && Array.isArray(event.derived_kpis) && event.derived_kpis.length > 0) ? (
            <section id="derived-entities" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>Derived Entities</h2>
              {event.derived_metrics && Array.isArray(event.derived_metrics) && event.derived_metrics.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-700)' }}>Derived Metrics</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {event.derived_metrics.map((derivedSlug) => (
                      <Link
                        key={derivedSlug}
                        href={`/metrics/${derivedSlug}`}
              style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'var(--ifm-color-primary)',
                          color: '#fff',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                        }}
                      >
                        {derivedSlug}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {event.derived_kpis && Array.isArray(event.derived_kpis) && event.derived_kpis.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--ifm-color-emphasis-700)' }}>Derived KPIs</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {event.derived_kpis.map((derivedSlug) => (
                      <Link
                        key={derivedSlug}
                        href={`/kpis/${derivedSlug}`}
              style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'var(--ifm-color-primary)',
                          color: '#fff',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.9rem',
                        }}
                      >
                        {derivedSlug}
                      </Link>
                    ))}
                  </div>
            </div>
              )}
            </section>
          ) : null}

          <section id="governance-metadata" className="section" style={{ lineHeight: '2', marginBottom: '2rem' }}>
            <h2 className="section-title">Governance & Metadata</h2>
            {renderDetailRow('Created by', event.created_by, 'created-by')}
            {renderDetailRow('Created on', event.created_at ? new Date(event.created_at).toLocaleDateString() : null, 'created-on')}
            {renderDetailRow('Last modified by', event.last_modified_by ?? undefined, 'last-modified-by')}
            {renderDetailRow('Last modified on', event.last_modified_at ? new Date(event.last_modified_at).toLocaleDateString() : null, 'last-modified-on')}
            {renderDetailRow('Status', event.status ? event.status.toUpperCase() : null, 'status')}
          </section>

          {event.github_pr_url && (
            <section id="github" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>GitHub</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href={event.github_pr_url} target="_blank" rel="noreferrer" style={{ color: 'var(--ifm-color-primary)' }}>
                  View related Pull Request
                </Link>
                {event.github_file_path && (
                  <code style={{ fontSize: '0.85rem', color: 'var(--ifm-color-emphasis-700)' }}>{event.github_file_path}</code>
                )}
          </div>
            </section>
          )}

          <section id="discussion" style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Community Discussion</h2>
            <GiscusComments category="events" term={event.slug} />
          </section>
        </article>

        <TableOfContents headings={headings} />
      </div>
    </main>
  );
}
