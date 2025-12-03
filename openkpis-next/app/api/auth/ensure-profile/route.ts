import type { PostgrestError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { ok, error, unauthorized } from '@/lib/api/response';
import { withTablePrefix } from '@/src/types/entities';
import { retry, isRetryableError } from '@/lib/utils/retry';

type UserProfileRow = {
  id: string;
  user_role: string;
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
            .from(withTablePrefix('user_profiles'))
            .select('id, user_role')
            .eq('id', user.id)
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
      const tableName = withTablePrefix('user_profiles');
      
      try {
        await retry(
          async () => {
            const { error: insertError, data: insertData } = await supabase
              .from(tableName)
              .insert({
                id: user.id,
                user_role: defaultRole,
                github_username: githubUsername,
                full_name: fullName,
                email: email,
                avatar_url: avatarUrl,
                role: 'user',
                is_editor: false,
                is_admin: false,
                last_active_at: new Date().toISOString(),
              })
              .select();

            if (insertError) {
              // Log detailed error for debugging
              console.error('[ensure-profile] Profile creation error:', {
                userId: user.id,
                tableName,
                errorCode: (insertError as PostgrestError).code,
                errorMessage: insertError.message,
                errorDetails: insertError.details,
                errorHint: insertError.hint,
              });

              // Check for duplicate key (race condition)
              if ((insertError as PostgrestError).code === '23505') {
                // Profile was created by another request - not an error
                console.log('[ensure-profile] Profile already exists (race condition):', user.id);
                return;
              }

              if (isRetryableError(insertError)) {
                throw insertError;
              }

              // Non-retryable error - include table name in error message
              throw new Error(`Failed to create profile in ${tableName}: ${insertError.message}`);
            }

            console.log('[ensure-profile] Profile created successfully:', {
              userId: user.id,
              tableName,
              data: insertData,
            });
          },
          {
            maxAttempts: 3,
            initialDelayMs: 200,
            maxDelayMs: 1000,
          }
        );

        return ok({ created: true, role: defaultRole, tableName });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create profile';
        console.error('[ensure-profile] Profile creation failed after retries:', {
          userId: user.id,
          tableName,
          error: errorMessage,
        });
        return error(errorMessage, 500);
      }
    }

    // Row exists; update enrichment fields and last_active_at (do not override role)
    try {
      await retry(
        async () => {
          const { error: updateError } = await supabase
            .from(withTablePrefix('user_profiles'))
            .update({
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


