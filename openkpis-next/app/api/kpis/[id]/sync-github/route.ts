import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { syncToGitHub } from '@/lib/services/github';
import { withTablePrefix } from '@/src/types/entities';

type SyncAction = 'created' | 'edited';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { action?: SyncAction };
    const action = body.action ?? 'edited';

    // Get Supabase admin client
    const supabase = createAdminClient();

    // Fetch KPI from Supabase
    const kpiTable = withTablePrefix('kpis');

    const { data: kpi, error: kpiError } = await supabase
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
    
    const result = await syncToGitHub({
      tableName: 'kpis',
      record: kpi,
      action,
      userLogin,
      userName: userLogin,
      contributorName,
      editorName,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'GitHub sync failed' }, { status: 500 });
    }

    // Update Supabase record
    await supabase
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
