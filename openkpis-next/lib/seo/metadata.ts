/**
 * SEO Metadata Utilities
 * Centralized functions for generating SEO metadata across the application
 */

import type { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openkpis.org';

export interface EntityMetadata {
  name: string;
  description?: string | null;
  slug: string;
  tags?: string[] | null;
  category?: string | null;
  created_at?: string | null;
  last_modified_at?: string | null;
  created_by?: string | null;
  status?: string | null;
}

export interface EntityTypeConfig {
  type: 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';
  typeLabel: string;
  typeLabelPlural: string;
  path: string;
}

/**
 * Generate metadata for entity detail pages
 */
export function generateEntityMetadata(
  entity: EntityMetadata | null,
  config: EntityTypeConfig
): Metadata {
  if (!entity || entity.status !== 'published') {
    return {
      title: `${config.typeLabel} Not Found | OpenKPIs`,
      description: `The requested ${config.typeLabel.toLowerCase()} could not be found.`,
    };
  }

  const title = `${entity.name} | ${config.typeLabel} | OpenKPIs`;
  const description = entity.description 
    ? `${entity.description.substring(0, 155)}${entity.description.length > 155 ? '...' : ''}`
    : `Learn about the ${entity.name} ${config.typeLabel.toLowerCase()}, including implementation guides and platform equivalents.`;
  
  const url = `${baseUrl}${config.path}/${entity.slug}`;
  const tags = entity.tags || [];
  const category = entity.category || '';

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'OpenKPIs',
      type: 'article',
      tags: tags.length > 0 ? tags : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords: tags.length > 0 
      ? [...tags, category, config.typeLabel, 'analytics', 'metrics'].filter(Boolean).join(', ')
      : undefined,
  };
}

/**
 * Generate structured data (JSON-LD) for entity detail pages
 */
export function generateEntityStructuredData(
  entity: EntityMetadata,
  config: EntityTypeConfig
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: entity.name,
    description: entity.description || '',
    url: `${baseUrl}${config.path}/${entity.slug}`,
    datePublished: entity.created_at,
    dateModified: entity.last_modified_at || entity.created_at,
    author: {
      '@type': 'Person',
      name: entity.created_by || 'OpenKPIs Community',
    },
    publisher: {
      '@type': 'Organization',
      name: 'OpenKPIs',
      url: baseUrl,
    },
    ...(entity.category && { articleSection: entity.category }),
    ...(entity.tags && entity.tags.length > 0 && { keywords: entity.tags.join(', ') }),
  };
}

/**
 * Generate metadata for listing pages
 */
export function generateListingMetadata(
  config: EntityTypeConfig,
  count?: number
): Metadata {
  const title = `${config.typeLabelPlural} | OpenKPIs`;
  const description = `Browse our collection of ${count ? `${count}+ ` : ''}standardized ${config.typeLabelPlural.toLowerCase()} for analytics professionals.`;
  const url = `${baseUrl}${config.path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'OpenKPIs',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

/**
 * Generate metadata for home page
 */
export function generateHomeMetadata(): Metadata {
  return {
    title: 'OpenKPIs - Community-Driven Analytics KPIs',
    description: 'Open-source repository of KPIs, Metrics, Dimensions, and Events for analytics professionals. Build consistent metrics across your organization.',
    alternates: {
      canonical: baseUrl,
    },
    openGraph: {
      title: 'OpenKPIs - Community-Driven Analytics KPIs',
      description: 'Standardized KPI definitions, dimensions, and events for modern analytics. Build consistent metrics across your organization.',
      url: baseUrl,
      siteName: 'OpenKPIs',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'OpenKPIs - Community-Driven Analytics KPIs',
      description: 'Standardized KPI definitions, dimensions, and events for modern analytics.',
    },
    keywords: 'KPIs, metrics, analytics, dimensions, events, data analytics, business intelligence, GA4, Adobe Analytics',
  };
}

