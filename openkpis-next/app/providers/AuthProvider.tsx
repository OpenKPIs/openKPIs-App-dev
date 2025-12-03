import React from 'react';
import type { User, SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import AuthClientProvider from './AuthClientProvider';
import { withTablePrefix } from '@/src/types/entities';
import { retry, isRetryableError } from '@/lib/utils/retry';

type Role = 'admin' | 'editor' | 'contributor';
type UserProfileRow = {
  id?: string;
  user_role: Role | null;
  role?: Role | null;
  is_admin?: boolean | null;
  is_editor?: boolean | null;
  [key: string]: unknown;
};

/**
 * Load user profile with retry logic for transient failures
 */
async function loadUserProfile(supabase: SupabaseClient, userId: string) {
	return await retry(
		async () => {
			const { data: profile, error } = await supabase
				.from(withTablePrefix('user_profiles'))
				.select('user_role, role, is_admin, is_editor')
				.eq('id', userId)
				.maybeSingle();

			// PGRST116 is "no rows returned" - not an error, just no profile yet
			if (error && (error as PostgrestError).code !== 'PGRST116') {
				// Only throw retryable errors
				if (isRetryableError(error)) {
					throw error;
				}
				// Log non-retryable errors but don't throw
				console.error('[AuthProvider] Error loading profile (non-retryable):', {
					userId,
					errorCode: (error as PostgrestError).code,
					errorMessage: (error as PostgrestError).message,
				});
			}

			return profile;
		},
		{
			maxAttempts: 3,
			initialDelayMs: 200,
			maxDelayMs: 1000,
			onRetry: (attempt, error) => {
				console.warn(`[AuthProvider] Retrying profile load (attempt ${attempt}/3):`, {
					userId,
					error: error instanceof Error ? error.message : String(error),
				});
			},
		}
	);
}

/**
 * Create user profile with retry logic for transient failures
 */
async function createUserProfile(
	supabase: SupabaseClient,
	userId: string,
	profileData: {
		githubUsername: string | null;
		fullName: string | null;
		email: string | null;
		avatarUrl: string | null;
	}
) {
	return await retry(
		async () => {
			const { data: inserted, error: insertError } = await supabase
				.from(withTablePrefix('user_profiles'))
				.insert({
					id: userId,
					user_role: 'contributor',
					github_username: profileData.githubUsername,
					full_name: profileData.fullName,
					email: profileData.email,
					avatar_url: profileData.avatarUrl,
					role: 'user',
					is_editor: false,
					is_admin: false,
					last_active_at: new Date().toISOString(),
				})
				.select('user_role, role, is_admin, is_editor')
				.single();

			if (insertError) {
				const tableName = withTablePrefix('user_profiles');
				
				// Log detailed error for debugging
				console.error('[AuthProvider] Profile creation error:', {
					userId,
					tableName,
					errorCode: (insertError as PostgrestError).code,
					errorMessage: insertError.message,
					errorDetails: insertError.details,
					errorHint: insertError.hint,
				});

				// Check if it's a duplicate key error (profile already exists)
				// This can happen in race conditions - not retryable
				if ((insertError as PostgrestError).code === '23505') {
					console.warn('[AuthProvider] Profile already exists (race condition):', userId);
					// Try to load it instead
					return await loadUserProfile(supabase, userId);
				}

				// Only throw retryable errors
				if (isRetryableError(insertError)) {
					throw insertError;
				}

				// Log non-retryable errors with table name
				console.error('[AuthProvider] Error creating profile (non-retryable):', {
					userId,
					tableName,
					errorCode: (insertError as PostgrestError).code,
					errorMessage: (insertError as PostgrestError).message,
					errorDetails: (insertError as PostgrestError).details,
					errorHint: (insertError as PostgrestError).hint,
				});
				return null;
			}

			return inserted;
		},
		{
			maxAttempts: 3,
			initialDelayMs: 200,
			maxDelayMs: 1000,
			onRetry: (attempt, error) => {
				console.warn(`[AuthProvider] Retrying profile creation (attempt ${attempt}/3):`, {
					userId,
					error: error instanceof Error ? error.message : String(error),
				});
			},
		}
	);
}

/**
 * Update user profile with retry logic for transient failures
 */
async function updateUserProfile(
	supabase: SupabaseClient,
	userId: string,
	profileData: {
		githubUsername: string | null;
		fullName: string | null;
		email: string | null;
		avatarUrl: string | null;
	}
) {
	return await retry(
		async () => {
			const { error: updateError } = await supabase
				.from(withTablePrefix('user_profiles'))
				.update({
					github_username: profileData.githubUsername,
					full_name: profileData.fullName,
					email: profileData.email,
					avatar_url: profileData.avatarUrl,
					last_active_at: new Date().toISOString(),
				})
				.eq('id', userId);

			if (updateError) {
				// Only throw retryable errors
				if (isRetryableError(updateError)) {
					throw updateError;
				}

				// Log non-retryable errors
				console.error('[AuthProvider] Error updating profile (non-retryable):', {
					userId,
					errorCode: (updateError as PostgrestError).code,
					errorMessage: (updateError as PostgrestError).message,
				});
			}

			return true;
		},
		{
			maxAttempts: 3,
			initialDelayMs: 200,
			maxDelayMs: 1000,
			onRetry: (attempt, error) => {
				console.warn(`[AuthProvider] Retrying profile update (attempt ${attempt}/3):`, {
					userId,
					error: error instanceof Error ? error.message : String(error),
				});
			},
		}
	);
}

async function resolveUserRole(supabase: SupabaseClient, user: User) {
	// Load profile with retry logic
	let profileData: UserProfileRow | null = null;
	try {
		profileData = await loadUserProfile(supabase, user.id);
	} catch (error) {
		// If all retries fail, log but continue with default role
		console.error('[AuthProvider] Failed to load profile after retries:', {
			userId: user.id,
			error: error instanceof Error ? error.message : String(error),
		});
	}

	const githubUsername =
		(user.user_metadata?.user_name as string | undefined) ||
		(user.user_metadata?.preferred_username as string | undefined) ||
		null;
	const fullName = (user.user_metadata?.full_name as string | undefined) || null;
	const email = user.email || null;
	const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) || null;

	if (!profileData) {
		// Create profile with retry logic
		const tableName = withTablePrefix('user_profiles');
		try {
			const inserted = await createUserProfile(supabase, user.id, {
				githubUsername,
				fullName,
				email,
				avatarUrl,
			});
			if (inserted) {
				profileData = inserted;
				console.log('[AuthProvider] Profile created successfully:', {
					userId: user.id,
					tableName,
				});
			} else {
				console.warn('[AuthProvider] Profile creation returned null:', {
					userId: user.id,
					tableName,
				});
			}
		} catch (error) {
			// If all retries fail, log but continue with default role
			console.error('[AuthProvider] Failed to create profile after retries:', {
				userId: user.id,
				tableName,
				error: error instanceof Error ? error.message : String(error),
				errorStack: error instanceof Error ? error.stack : undefined,
			});
		}
	} else {
		// Update profile with retry logic (non-blocking)
		updateUserProfile(supabase, user.id, {
			githubUsername,
			fullName,
			email,
			avatarUrl,
		}).catch((error) => {
			// Log but don't block - profile update is non-critical
			console.error('[AuthProvider] Failed to update profile after retries:', {
				userId: user.id,
				error: error instanceof Error ? error.message : String(error),
			});
		});
	}

	const resolvedRole =
		(profileData?.user_role ||
			profileData?.role ||
			(user.user_metadata?.user_role as string | undefined) ||
			'contributor')?.toString().toLowerCase() as Role;

	if (resolvedRole === 'admin' || resolvedRole === 'editor') {
		return resolvedRole;
	}
	if (profileData?.is_admin) return 'admin';
	if (profileData?.is_editor) return 'editor';
	return 'contributor';
}

export default async function AuthProvider({ children }: { children: React.ReactNode }) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const initialUser = user ?? null;
	const initialRole: Role = initialUser ? await resolveUserRole(supabase, initialUser) : 'contributor';

	// We still seed the client with the current session so the browser Supabase client
	// has tokens available immediately. This does not change how we trust the user identity.
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return (
		<AuthClientProvider initialSession={session ?? null} initialUser={initialUser} initialRole={initialRole}>
			{children}
		</AuthClientProvider>
	);
}
