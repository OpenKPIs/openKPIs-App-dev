import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { syncToGitHub } from '@/lib/services/github';
import { withTablePrefix } from '@/src/types/entities';

type SyncAction = 'created' | 'edited';

const eventsTable = withTablePrefix('events');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const body = (await request.json()) as { action?: SyncAction };
    const action = body.action ?? 'edited';

    const { data: event, error } = await supabase
      .from(eventsTable)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Use last_modified_by for edits (Editor), created_by for creates (Contributor)
    const userLogin = (action === 'edited' && event.last_modified_by) 
      ? event.last_modified_by 
      : (event.created_by || 'unknown');
    const contributorName = event.created_by || 'unknown';
    const editorName = event.last_modified_by || null;
    
    const result = await syncToGitHub({
      tableName: 'events',
      record: event,
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
      .from(eventsTable)
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
    console.error('GitHub sync error (event):', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

