import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { syncToGitHub } from '@/lib/services/github';
import { getVerifiedEmailFromGitHubTokenCookie } from '@/lib/github/verifiedEmail';
import { withTablePrefix } from '@/src/types/entities';
import type { Event } from '@/lib/types/database';

type EventRow = Event;
type SyncAction = 'created' | 'edited';

const eventsTable = withTablePrefix('events');

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
    const { data: event, error } = await admin
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
    
    const verifiedEmail = await getVerifiedEmailFromGitHubTokenCookie().catch(() => null);
    const result = await syncToGitHub({
      tableName: 'events',
      record: event,
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

