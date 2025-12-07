import type { SupabaseClient, User } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/server';
import { syncToGitHub } from '@/lib/services/github';
import { getVerifiedEmailFromGitHubTokenCookie } from '@/lib/github/verifiedEmail';
import type { EntityKind } from '@/src/types/entities';
import { tableFor, withTablePrefix } from '@/src/types/entities';

type UpdateInput = {
	kind: EntityKind;
	id: string;
	data: Record<string, unknown>;
	user: User;
	userClient: SupabaseClient;
};

type UpdateResult = {
	success: true;
	github?: {
		prNumber?: number;
		prUrl?: string;
		commitSha?: string;
		branch?: string;
	};
};

type PayloadBuilder = (data: Record<string, unknown>, userHandle: string) => Record<string, unknown>;

const KPI_FIELDS: PayloadBuilder = (data, userHandle) => {
	const toString = (value: unknown) => (typeof value === 'string' ? value : '');
	const toStringArray = (value: unknown): string[] => {
		if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string');
		if (typeof value === 'string' && value.trim().length > 0) return [value.trim()];
		return [];
	};

	return {
		name: toString(data.name),
		description: toString(data.description),
		formula: toString(data.formula),
		category: toString(data.category),
		tags: toStringArray(data.tags),
		industry: toStringArray(data.industry),
		priority: toString(data.priority),
		core_area: toString(data.core_area),
		scope: toString(data.scope),
		kpi_type: toString(data.kpi_type),
		aggregation_window: toString(data.aggregation_window),
		ga4_implementation: toString(data.ga4_implementation),
		adobe_implementation: toString(data.adobe_implementation),
		amplitude_implementation: toString(data.amplitude_implementation),
		data_layer_mapping: toString(data.data_layer_mapping),
		xdm_mapping: toString(data.xdm_mapping),
		sql_query: toString(data.sql_query),
		calculation_notes: toString(data.calculation_notes),
		details: toString(data.details),
		status: 'draft',
		last_modified_by: userHandle,
		last_modified_at: new Date().toISOString(),
	};
};

const SIMPLE_FIELDS = (fields: string[]): PayloadBuilder => {
	const builder: PayloadBuilder = (data, userHandle) => {
		const payload: Record<string, unknown> = {};

		for (const field of fields) {
			const value = data[field];
			if (Array.isArray(value)) {
				payload[field] = value.filter((item): item is string => typeof item === 'string');
			} else if (typeof value === 'string') {
				payload[field] = value;
			} else if (value === null) {
				payload[field] = null;
			}
		}

		payload.status = 'draft';
		payload.last_modified_by = userHandle;
		payload.last_modified_at = new Date().toISOString();

		return payload;
	};

	return builder;
};

const PAYLOAD_BUILDERS: Record<EntityKind, PayloadBuilder> = {
	kpi: KPI_FIELDS,
	metric: SIMPLE_FIELDS(['name', 'description', 'formula', 'category', 'tags']),
	dimension: SIMPLE_FIELDS(['name', 'description', 'category', 'tags']),
	event: SIMPLE_FIELDS(['name', 'description', 'category', 'tags']),
	dashboard: SIMPLE_FIELDS(['name', 'description', 'category', 'tags']),
};

function resolveUserHandle(user: User): string {
	return (
		(typeof user.user_metadata?.user_name === 'string' && user.user_metadata.user_name) ||
		user.email ||
		user.id
	);
}

export async function updateEntityDraftAndSync(params: UpdateInput): Promise<UpdateResult> {
	const { id, kind, data, user, userClient } = params;
	const tableName = tableFor(kind);
	const table = withTablePrefix(tableName);
	const userHandle = resolveUserHandle(user);
	const payloadBuilder = PAYLOAD_BUILDERS[kind];

	if (!payloadBuilder) {
		throw new Error(`Unsupported entity kind: ${kind}`);
	}

	const updatePayload = payloadBuilder(data, userHandle);

	const { error: updateError } = await userClient.from(table).update(updatePayload).eq('id', id);
	if (updateError) {
		throw new Error(updateError.message || 'Failed to update entity');
	}

	const adminClient = createAdminClient();
	const { data: record, error: fetchError } = await adminClient.from(table).select('*').eq('id', id).single();

	if (fetchError || !record) {
		throw new Error(fetchError?.message || 'Failed to load updated entity');
	}

	const contributorName = typeof record.created_by === 'string' && record.created_by.length > 0 ? record.created_by : userHandle;
	const editorName =
		typeof record.last_modified_by === 'string' && record.last_modified_by.length > 0 ? record.last_modified_by : userHandle;

	const verifiedEmail = await getVerifiedEmailFromGitHubTokenCookie().catch(() => null);

	const syncResult = await syncToGitHub({
		tableName: tableName as 'kpis' | 'events' | 'dimensions' | 'metrics' | 'dashboards',
		record,
		action: 'edited',
		userLogin: editorName,
		userName: editorName,
		userEmail: verifiedEmail || user.email || undefined,
		contributorName,
		editorName,
		userId: user.id, // Pass userId for token retrieval
	});

	if (!syncResult.success) {
		throw new Error(syncResult.error || 'GitHub sync failed');
	}

	await adminClient
		.from(table)
		.update({
			github_commit_sha: syncResult.commit_sha,
			github_pr_number: syncResult.pr_number,
			github_pr_url: syncResult.pr_url,
			github_file_path: syncResult.file_path,
		})
		.eq('id', id);

	return {
		success: true,
		github: {
			prNumber: syncResult.pr_number,
			prUrl: syncResult.pr_url,
			commitSha: syncResult.commit_sha,
			branch: syncResult.branch,
		},
	};
}

