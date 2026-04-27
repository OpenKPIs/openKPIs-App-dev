'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { EntityKind, AnyEntity } from '@/src/types/entities';
import AddToAnalysisButton from '@/components/AddToAnalysisButton';
import AddToPlanButton from '@/components/AddToPlanButton';

type Section = 'kpis' | 'events' | 'dimensions' | 'metrics' | 'dashboards';

type CatalogProps = {
	items: AnyEntity[];
	kind?: EntityKind;
	section?: Section;
	title?: string;
	description?: string;
	addNewPath?: string | null;
};

function sectionToKind(section: Section): EntityKind {
	switch (section) {
		case 'kpis': return 'kpi';
		case 'events': return 'event';
		case 'dimensions': return 'dimension';
		case 'metrics': return 'metric';
		case 'dashboards': return 'dashboard';
	}
}

function kindToSection(kind: EntityKind): Section {
	switch (kind) {
		case 'kpi': return 'kpis';
		case 'event': return 'events';
		case 'dimension': return 'dimensions';
		case 'metric': return 'metrics';
		case 'dashboard': return 'dashboards';
	}
}

function defaultDescription(kind: EntityKind): string | undefined {
	switch (kind) {
		case 'dimension':
			return 'Data attributes and segmentation variables used across KPIs for consistent analysis.';
		case 'metric':
			return 'Standardized metrics and measurements for analytics.';
		case 'event':
			return 'Tracking events and parameters needed to calculate KPIs across different platforms.';
		case 'dashboard':
			return 'Pre-configured dashboard templates and configurations.';
		case 'kpi':
			return 'Standardized KPI definitions with formulas, implementation guides, and platform equivalents.';
		default:
			return undefined;
	}
}

function getEntityPath(kind: EntityKind): string {
	return `/${kindToSection(kind)}`;
}

export default function Catalog({
	items,
	kind: explicitKind,
	section,
	title,
	description,
	addNewPath,
}: CatalogProps) {
	if (!explicitKind && !section) {
		throw new Error('Catalog requires either a `kind` or `section` prop together with `items`.');
	}

	const kind: EntityKind = explicitKind || sectionToKind(section!);
	const derivedSection: Section = kindToSection(kind);
	const derivedTitle = title ?? derivedSection.charAt(0).toUpperCase() + derivedSection.slice(1);
	const derivedDescription = description ?? defaultDescription(kind);
	const finalAddNewPath = addNewPath ?? `/${derivedSection}/new`;

	const [search, setSearch] = useState('');

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return items;
		return items.filter((it) => {
			const hay = [
				it.name,
				it.description ?? '',
				it.slug,
				...(it.tags ?? []),
				it.category ?? '',
			]
				.filter(Boolean)
				.join(' ')
				.toLowerCase();
			return hay.includes(q);
		});
	}, [items, search]);

	const basePath = getEntityPath(kind);

	return (
		<main style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
				<div style={{ flex: '1 1 auto' }}>
					<h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{derivedTitle}</h1>
					{derivedDescription ? (
						<p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: 0 }}>{derivedDescription}</p>
					) : null}
				</div>
				{finalAddNewPath ? (
					<div>
						<Link href={finalAddNewPath} prefetch={false} className="btn btn-primary">
							{`Add New ${kind === 'kpi' ? 'KPI' : kind.charAt(0).toUpperCase() + kind.slice(1)}`}
						</Link>
					</div>
				) : null}
			</div>

			<div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: '1rem' }}>
				<input
					type="text"
					className="input"
					placeholder={`Search ${derivedTitle}...`}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					style={{ minWidth: 240, width: '100%', maxWidth: 420 }}
				/>
			</div>

			<div style={{ marginBottom: '1rem', color: 'var(--ifm-color-emphasis-600)', fontSize: '0.875rem' }}>
				{`${filtered.length} ${filtered.length === 1 ? 'item' : 'items'} found`}
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
				{filtered.map((it: AnyEntity) => (
					<Link key={it.id} href={`${basePath}/${it.slug}`} prefetch={false} style={{ textDecoration: 'none', color: 'inherit' }}>
						<div className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
							<div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
								<h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-900)', flex: 1 }}>
									{it.name}
								</h3>
								{it.status === 'draft' ? (
									<span
										style={{
											fontSize: '0.75rem',
											padding: '0.125rem 0.5rem',
											backgroundColor: '#fee2e2',
											color: '#b91c1c',
											borderRadius: 4,
											fontWeight: 600,
											whiteSpace: 'nowrap',
										}}
									>
										Draft
									</span>
								) : null}
							</div>
							{it.description ? (
								<p
									style={{
										color: 'var(--ifm-color-emphasis-600)',
										fontSize: '0.875rem',
										lineHeight: 1.5,
										marginTop: '0.75rem',
										marginBottom: '0.75rem',
										flex: 1,
										display: '-webkit-box',
										WebkitLineClamp: 3,
										WebkitBoxOrient: 'vertical',
										overflow: 'hidden',
									}}
								>
									{it.description}
								</p>
							) : null}
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
								{it.category ? (
									<span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: 4, color: 'var(--ifm-color-emphasis-700)' }}>
										{it.category}
									</span>
								) : null}
								{(it.tags ?? []).slice(0, 3).map((tag) => (
									<span key={tag} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: 4, color: 'var(--ifm-color-emphasis-700)' }}>
										{tag}
									</span>
								))}
							</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }} onClick={(e) => e.preventDefault()}>
                {kind !== 'dashboard' && (
                  <AddToPlanButton item={{ id: it.id, type: kind as 'kpi' | 'metric' | 'dimension' | 'event', name: it.name }} variant="icon" />
                )}
                <AddToAnalysisButton itemType={kind} itemId={it.id} itemSlug={it.slug} itemName={it.name} variant="icon" />
              </div>
						</div>
					</Link>
				))}
			</div>

			{filtered.length === 0 ? (
				<div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ifm-color-emphasis-600)' }}>
					<p>No items found. Try adjusting your search.</p>
				</div>
			) : null}
		</main>
	);
}



