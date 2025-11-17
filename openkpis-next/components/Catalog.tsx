'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { EntityKind, AnyEntity } from '@/src/types/entities';
import { useEntityList } from '@/hooks/useEntityList';
import { useAuth } from '@/app/providers/AuthProvider';

type Section = 'kpis' | 'events' | 'dimensions' | 'metrics' | 'dashboards';

type NewProps = {
	kind: EntityKind;
	title?: string;
	description?: string;
	addNewPath?: string;
};

type LegacyProps = {
	section: Section;
};

type CatalogProps = NewProps | LegacyProps;

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

export default function Catalog(props: CatalogProps) {
	// Backward-compat: support legacy { section } prop
	const kind: EntityKind = ('section' in props) ? sectionToKind(props.section) : props.kind;
	const section: Section = kindToSection(kind);
	const derivedTitle = ('title' in props && props.title) ? props.title : section.charAt(0).toUpperCase() + section.slice(1);
	const addNewPath = ('addNewPath' in props && props.addNewPath) ? props.addNewPath : `/${section}/new`;
	const description = ('description' in props) ? (props as NewProps).description : defaultDescription(kind);

	const [search, setSearch] = useState('');
	const { user } = useAuth();
	const createdBys: string[] = [];
	const gh = (user?.user_metadata?.user_name as string | undefined) || '';
	const email = (user?.email as string | undefined) || '';
	if (gh) createdBys.push(gh);
	if (email) createdBys.push(email);
	const { items, loading, error } = useEntityList({
		kind,
		search,
		status: 'published',
		includeCreatedBy: createdBys.length ? createdBys : undefined,
		limit: 500,
	});

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return items;
		return items.filter((it: AnyEntity) => {
			const hay = [
				it.name,
				(it as any).description,
				(it as any).slug,
				...(((it as any).tags as string[] | undefined) || []),
				(it as any).category,
			].filter(Boolean).join(' ').toLowerCase();
			return hay.includes(q);
		});
	}, [items, search]);

	const basePath = getEntityPath(kind);

	return (
		<main style={{ padding: '2rem 1rem', maxWidth: '1400px', margin: '0 auto' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
				<div style={{ flex: '1 1 auto' }}>
					<h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{derivedTitle}</h1>
					{description ? (
						<p style={{ color: 'var(--ifm-color-emphasis-600)', marginBottom: 0 }}>{description}</p>
					) : null}
				</div>
				{addNewPath ? (
					<div>
						<Link href={addNewPath} className="btn btn-primary" prefetch={false}>
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
				{error ? (
					<span style={{ color: '#991b1b' }}>Failed to load items.</span>
				) : (
					`${filtered.length} ${filtered.length === 1 ? 'item' : 'items'} found`
				)}
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
				{filtered.map((it: AnyEntity) => (
					<Link key={(it as any).id} href={`${basePath}/${(it as any).slug}`} prefetch={false} style={{ textDecoration: 'none', color: 'inherit' }}>
						<div className="card" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
							<h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--ifm-color-emphasis-900)' }}>
								{it.name}
							</h3>
							{(it as any).description ? (
								<p style={{
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
								}}>
									{(it as any).description}
								</p>
							) : <div style={{ flex: 1 }} /> }
							<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: 'auto' }}>
								{(it as any).category ? (
									<span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: 4, color: 'var(--ifm-color-emphasis-700)' }}>
										{(it as any).category}
									</span>
								) : null}
								{(((it as any).tags as string[] | undefined) || []).slice(0, 3).map((tag: string) => (
									<span key={tag} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'var(--ifm-color-emphasis-100)', borderRadius: 4, color: 'var(--ifm-color-emphasis-700)' }}>
										{tag}
									</span>
								))}
							</div>
						</div>
					</Link>
				))}
			</div>

			{!loading && filtered.length === 0 ? (
				<div style={{ textAlign: 'center', padding: '3rem', color: 'var(--ifm-color-emphasis-600)' }}>
					<p>No items found. Try adjusting your search.</p>
				</div>
			) : null}
		</main>
	);
}



