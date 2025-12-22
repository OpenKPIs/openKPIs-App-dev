/**
 * Debug API Route: Profile Sync Testing
 * 
 * This endpoint helps debug profile creation issues in dev_user_profiles.
 * 
 * @route GET /api/debug/profile-sync
 * @returns Debug information about profile sync
 */

import { createClient } from '@/lib/supabase/server';
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

    const tableName = withTablePrefix('user_profiles');
    
    // Check if profile exists
    const { data: existingProfile, error: selectError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // Try to get table info (this might fail due to RLS, but we'll try)
    let tableInfo = null;
    try {
      // Try a simple query to see if table exists and is accessible
      const { count, error: countError } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      tableInfo = {
        exists: !countError || countError.code !== '42P01', // 42P01 = table does not exist
        accessible: !countError,
        countError: countError?.message || null,
        count: count || null,
      };
    } catch (err) {
      tableInfo = {
        error: err instanceof Error ? err.message : String(err),
      };
    }

    // Try to create a test profile (this will fail if profile exists, which is expected)
    let createTest = null;
    if (!existingProfile) {
      try {
        const { error: insertError, data: insertData } = await supabase
          .from(tableName)
          .insert({
            id: user.id,
            user_role: 'contributor',
            github_username: user.user_metadata?.user_name || null,
            full_name: user.user_metadata?.full_name || null,
            email: user.email || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            role: 'user',
            is_editor: false,
            is_admin: false,
            last_active_at: new Date().toISOString(),
          })
          .select();

        createTest = {
          success: !insertError,
          error: insertError ? {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
          } : null,
          data: insertData || null,
        };
      } catch (err) {
        createTest = {
          error: err instanceof Error ? err.message : String(err),
        };
      }
    } else {
      createTest = {
        skipped: 'Profile already exists',
      };
    }

    return ok({
      user: {
        id: user.id,
        email: user.email,
      },
      environment: {
        NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'not set',
        tableName,
        resolvedPrefix: withTablePrefix('user_profiles'),
      },
      existingProfile: existingProfile || null,
      selectError: selectError ? {
        code: selectError.code,
        message: selectError.message,
        details: selectError.details,
        hint: selectError.hint,
      } : null,
      tableInfo,
      createTest,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return ok({
      error: message,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }
}






