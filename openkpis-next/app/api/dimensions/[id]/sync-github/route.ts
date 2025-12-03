import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { syncToGitHub } from '@/lib/services/github';
import { withTablePrefix } from '@/src/types/entities';

type SyncAction = 'created' | 'edited';

const dimensionsTable = withTablePrefix('dimensions');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const body = (await request.json()) as { action?: SyncAction };
    const action = body.action ?? 'edited';

    const { data: dimension, error } = await supabase
      .from(dimensionsTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dimension) {
      return NextResponse.json({ error: 'Dimension not found' }, { status: 404 });
    }

    // Use last_modified_by for edits (Editor), created_by for creates (Contributor)
    const userLogin = (action === 'edited' && dimension.last_modified_by) 
      ? dimension.last_modified_by 
      : (dimension.created_by || 'unknown');
    const contributorName = dimension.created_by || 'unknown';
    const editorName = dimension.last_modified_by || null;
    
    const result = await syncToGitHub({
      tableName: 'dimensions',
      record: dimension,
      action,
      userLogin,
      userName: userLogin,
      contributorName,
      editorName,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'GitHub sync failed' }, { status: 500 });
    }

    await supabase
      .from(dimensionsTable)
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
    console.error('GitHub sync error (dimension):', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

