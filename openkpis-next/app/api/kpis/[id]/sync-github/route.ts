import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { syncToGitHub } from '@/lib/services/github';
import { getVerifiedEmailFromGitHubTokenCookie } from '@/lib/github/verifiedEmail';
import { withTablePrefix } from '@/src/types/entities';
import type { KPI } from '@/lib/types/database';

type KpiRow = KPI;
type SyncAction = 'created' | 'edited';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { action?: SyncAction };
    const action = body.action ?? 'edited';

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

    // Fetch KPI from Supabase
    const kpiTable = withTablePrefix('kpis');

    const { data: kpi, error: kpiError } = await admin
      .from(kpiTable)
      .select('*')
      .eq('id', id)
      .single();

    if (kpiError || !kpi) {
      return NextResponse.json(
        { error: 'KPI not found' },
        { status: 404 }
      );
    }

    // Use last_modified_by for edits (Editor), created_by for creates (Contributor)
    // This ensures Editor edits show Editor as author, but Contributor remains in PR body
    const userLogin = (action === 'edited' && kpi.last_modified_by) 
      ? kpi.last_modified_by 
      : (kpi.created_by || 'unknown');
    const contributorName = kpi.created_by || 'unknown';
    const editorName = kpi.last_modified_by || null;
    
    const verifiedEmail = await getVerifiedEmailFromGitHubTokenCookie().catch(() => null);
    const result = await syncToGitHub({
      tableName: 'kpis',
      record: kpi,
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
      .from(kpiTable)
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
