/**
 * Debug API Route: User Role Resolution
 * 
 * This endpoint provides debugging information about user role resolution.
 * Used for troubleshooting editor page access issues.
 * 
 * @route GET /api/debug/user-role
 * @returns User role information and debug data
 */

import { createClient } from '@/lib/supabase/server';
import { getUserRoleServer } from '@/lib/roles/server';
import { withTablePrefix } from '@/src/types/entities';
import { ok, unauthorized } from '@/lib/api/response';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized();
    }

    // Get role using the same function the editor page uses
    const role = await getUserRoleServer();

    // Also check profile directly for debugging
    const tableName = withTablePrefix('user_profiles');
    const { data: profile, error: profileError } = await supabase
      .from(tableName)
      .select('id, email, user_role, role, is_admin, is_editor')
      .eq('id', user.id)
      .maybeSingle();

    return ok({
      user: {
        id: user.id,
        email: user.email,
        metadata_role: user.user_metadata?.user_role,
      },
      resolvedRole: role,
      profile: profile || null,
      profileError: profileError?.message || null,
      canAccessEditor: role === 'admin' || role === 'editor',
      debug: {
        tableName,
        profileExists: !!profile,
        profileUserRole: profile?.user_role,
        profileRole: profile?.role,
        profileIsAdmin: profile?.is_admin,
        profileIsEditor: profile?.is_editor,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return ok({
      error: message,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
}
