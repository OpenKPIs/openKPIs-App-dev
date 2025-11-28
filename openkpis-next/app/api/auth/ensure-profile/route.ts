import type { PostgrestError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { ok, error, unauthorized } from '@/lib/api/response';
import { currentAppEnv } from '@/src/types/entities';
import { retry, isRetryableError } from '@/lib/utils/retry';

type UserProfileRow = {
  id: string;
  user_role: string;
  app_env: 'dev' | 'prod';
};

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return unauthorized();
    }

    const appEnv = currentAppEnv();

    const githubUsername =
      (user.user_metadata?.user_name as string | undefined) ||
      (user.user_metadata?.preferred_username as string | undefined) ||
      null;
    const fullName = (user.user_metadata?.full_name as string | undefined) || null;
    const email = user.email || null;
    const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) || null;

    // Load profile with retry logic
    let existing: UserProfileRow | null = null;
    try {
      existing = await retry(
        async () => {
          const { data: profile, error: selectError } = await supabase
            .from('user_profiles')
            .select('id, user_role, app_env')
            .eq('id', user.id)
            .eq('app_env', appEnv)
            .maybeSingle();

          // PGRST116 is "no rows returned" - not an error
          if (selectError && (selectError as PostgrestError).code !== 'PGRST116') {
            if (isRetryableError(selectError)) {
              throw selectError;
            }
            // Non-retryable error - return null
            return null;
          }

          return profile;
        },
        {
          maxAttempts: 3,
          initialDelayMs: 200,
          maxDelayMs: 1000,
        }
      );
    } catch (err) {
      // If all retries fail, return error
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      return error(errorMessage, 500);
    }

    if (!existing) {
      // Create profile with retry logic
      const defaultRole = 'contributor';
      try {
        await retry(
          async () => {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: user.id,
                app_env: appEnv,
                user_role: defaultRole,
                github_username: githubUsername,
                full_name: fullName,
                email: email,
                avatar_url: avatarUrl,
                role: 'user',
                is_editor: false,
                is_admin: false,
                last_active_at: new Date().toISOString(),
              });

            if (insertError) {
              // Check for duplicate key (race condition)
              if ((insertError as PostgrestError).code === '23505') {
                // Profile was created by another request - not an error
                return;
              }

              if (isRetryableError(insertError)) {
                throw insertError;
              }

              // Non-retryable error
              throw new Error(insertError.message);
            }
          },
          {
            maxAttempts: 3,
            initialDelayMs: 200,
            maxDelayMs: 1000,
          }
        );

        return ok({ created: true, role: defaultRole });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
        return error(errorMessage, 500);
      }
    }

    // Row exists; update enrichment fields and last_active_at (do not override role)
    try {
      await retry(
        async () => {
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({
              app_env: appEnv,
              github_username: githubUsername,
              full_name: fullName,
              email: email,
              avatar_url: avatarUrl,
              last_active_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (updateError) {
            if (isRetryableError(updateError)) {
              throw updateError;
            }
            throw new Error(updateError.message);
          }
        },
        {
          maxAttempts: 3,
          initialDelayMs: 200,
          maxDelayMs: 1000,
        }
      );

      return ok({ created: false, role: existing.user_role });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      return error(errorMessage, 500);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return error(message, 500);
  }
}


