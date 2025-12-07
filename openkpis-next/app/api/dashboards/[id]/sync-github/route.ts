import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { syncToGitHub } from '@/lib/services/github';
import { getVerifiedEmailFromGitHubTokenCookie } from '@/lib/github/verifiedEmail';
import { withTablePrefix } from '@/src/types/entities';

type DashboardRow = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  created_by: string;
  created_at: string;
  last_modified_by?: string;
  last_modified_at?: string;
  github_pr_url?: string;
  github_pr_number?: number;
  github_commit_sha?: string;
  github_file_path?: string;
  [key: string]: unknown;
};
type SyncAction = 'created' | 'edited';

const dashboardsTable = withTablePrefix('dashboards');

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

    const admin = createAdminClient();
    const { data: dashboard, error } = await admin
      .from(dashboardsTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dashboard) {
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
    }

    // Use last_modified_by for edits (Editor), created_by for creates (Contributor)
    const userLogin = (action === 'edited' && dashboard.last_modified_by) 
      ? dashboard.last_modified_by 
      : (dashboard.created_by || 'unknown');
    const contributorName = dashboard.created_by || 'unknown';
    const editorName = dashboard.last_modified_by || null;
    
    const verifiedEmail = await getVerifiedEmailFromGitHubTokenCookie().catch(() => null);
    const result = await syncToGitHub({
      tableName: 'dashboards',
      record: dashboard,
      action,
      userLogin,
      userName: userLogin,
      userEmail: verifiedEmail || undefined,
      contributorName,
      editorName,
      userId: user.id,
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

    await admin
      .from(dashboardsTable)
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
    console.error('GitHub sync error (dashboard):', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

