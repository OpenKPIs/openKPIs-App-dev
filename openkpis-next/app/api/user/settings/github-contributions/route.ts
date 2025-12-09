import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { withTablePrefix } from '@/src/types/entities';

/**
 * API endpoint to toggle user's GitHub fork contributions preference
 * POST /api/user/settings/github-contributions
 * Body: { enabled: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { enabled } = body as { enabled: boolean };

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'enabled must be a boolean' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const tableName = withTablePrefix('user_profiles');

    // Update user preference
    const { error: updateError } = await admin
      .from(tableName)
      .update({
        enable_github_fork_contributions: enabled,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('[GitHub Contributions Settings] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      enabled,
      message: enabled 
        ? 'GitHub fork contributions enabled. Future KPIs will create forks and PRs for contribution credit.'
        : 'GitHub fork contributions disabled. Using Quick Create mode.',
    });
  } catch (error: unknown) {
    console.error('[GitHub Contributions Settings] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update preference';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve user's current preference
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const tableName = withTablePrefix('user_profiles');

    const { data: profile, error: selectError } = await admin
      .from(tableName)
      .select('enable_github_fork_contributions')
      .eq('id', user.id)
      .maybeSingle();

    if (selectError) {
      console.error('[GitHub Contributions Settings] Select error:', selectError);
      return NextResponse.json(
        { error: 'Failed to retrieve preference' },
        { status: 500 }
      );
    }

    // Default to true if not set (null) - this is the new default
    // Only return false if explicitly set to false
    // If profile doesn't exist, default to true
    const enabled = profile === null || profile?.enable_github_fork_contributions !== false;
    
    return NextResponse.json({
      enabled,
    });
  } catch (error: unknown) {
    console.error('[GitHub Contributions Settings] Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to retrieve preference';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

