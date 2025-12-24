import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { syncToGitHub } from '@/lib/services/github';
import { getVerifiedEmailFromGitHubTokenCookie } from '@/lib/github/verifiedEmail';
import { withTablePrefix } from '@/src/types/entities';
import type { KPI, Metric, Dimension, Event } from '@/lib/types/database';
import type { Dashboard } from '@/src/types/entities';
import type { EntityRecord } from '@/lib/services/github';

type SyncAction = 'created' | 'edited';
type EntityKind = 'kpi' | 'metric' | 'dimension' | 'event' | 'dashboard';

const TABLE_CONFIG: Record<EntityKind, { table: string; tableName: 'kpis' | 'metrics' | 'dimensions' | 'events' | 'dashboards' }> = {
  kpi: { table: withTablePrefix('kpis'), tableName: 'kpis' },
  metric: { table: withTablePrefix('metrics'), tableName: 'metrics' },
  dimension: { table: withTablePrefix('dimensions'), tableName: 'dimensions' },
  event: { table: withTablePrefix('events'), tableName: 'events' },
  dashboard: { table: withTablePrefix('dashboards'), tableName: 'dashboards' },
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ kind: string; id: string }> }
) {
  try {
    const { kind, id } = await params;
    const body = (await request.json()) as { action?: SyncAction };
    const action = body.action ?? 'edited';

    // Validate entity kind
    if (!['kpi', 'metric', 'dimension', 'event', 'dashboard'].includes(kind)) {
      return NextResponse.json(
        { error: `Invalid entity kind: ${kind}. Must be one of: kpi, metric, dimension, event, dashboard` },
        { status: 400 }
      );
    }

    const entityKind = kind as EntityKind;
    const config = TABLE_CONFIG[entityKind];

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required', requiresReauth: true },
        { status: 401 }
      );
    }

    // Get Supabase admin client for data operations
    const admin = createAdminClient();

    // Fetch entity from Supabase
    const { data: entity, error: entityError } = await admin
      .from(config.table)
      .select('*')
      .eq('id', id)
      .single();

    if (entityError || !entity) {
      return NextResponse.json(
        { error: `${entityKind.charAt(0).toUpperCase() + entityKind.slice(1)} not found` },
        { status: 404 }
      );
    }

    // Use last_modified_by for edits (Editor), created_by for creates (Contributor)
    // This ensures Editor edits show Editor as author, but Contributor remains in PR body
    const userLogin = (action === 'edited' && entity.last_modified_by) 
      ? entity.last_modified_by 
      : (entity.created_by || 'unknown');
    const contributorName = entity.created_by || 'unknown';
    const editorName = entity.last_modified_by || null;
    
    const verifiedEmail = await getVerifiedEmailFromGitHubTokenCookie().catch(() => null);
    const result = await syncToGitHub({
      tableName: config.tableName,
      record: entity as EntityRecord, // EntityRecord accepts all entity types
      action,
      userLogin,
      userName: userLogin,
      userEmail: verifiedEmail || undefined,
      contributorName,
      editorName,
      userId: user.id, // Pass userId for token retrieval
    });

    if (!result.success) {
      const status = result.requiresReauth ? 401 : 500;
      return NextResponse.json(
        { 
          error: result.error || 'GitHub sync failed',
          requiresReauth: result.requiresReauth || false,
        },
        { status }
      );
    }

    // Update Supabase record
    await admin
      .from(config.table)
      .update({
        github_commit_sha: result.commit_sha,
        github_pr_number: result.pr_number,
        github_pr_url: result.pr_url,
        github_file_path: result.file_path,
      })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      commit_sha: result.commit_sha,
      pr_number: result.pr_number,
      pr_url: result.pr_url,
      branch: result.branch,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sync to GitHub';
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

