import { cookies } from 'next/headers';

type GitHubEmail = {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility?: 'public' | null;
};

type EmailFetchResult = {
	email: string | null;
	error?: 'no_token' | 'token_invalid' | 'rate_limited' | 'scope_missing' | 'api_error' | 'network_error';
	rateLimitReset?: number;
};

/**
 * Fetch the user's verified email from GitHub using the provider token found in the secure cookie.
 * Returns the primary verified email if available, otherwise any verified email, otherwise null.
 * 
 * Enterprise-grade implementation with:
 * - Structured error handling
 * - Rate limit detection
 * - Token validation
 * - Retry logic
 * - Detailed logging
 */
export async function getVerifiedEmailFromGitHubTokenCookie(): Promise<string | null> {
	try {
		const cookieStore = await cookies();
		const token = cookieStore.get('openkpis_github_token')?.value;
		if (!token) {
			console.warn('[GitHub Email] No provider token found in cookie');
			return null;
		}
		
		const result = await getVerifiedEmailFromToken(token);
		if (result.error) {
			// Log error but don't throw - graceful degradation
			console.warn('[GitHub Email] Failed to fetch verified email:', {
				error: result.error,
				rateLimitReset: result.rateLimitReset,
			});
		}
		return result.email;
	} catch (error) {
		console.error('[GitHub Email] Unexpected error fetching email:', error);
		return null;
	}
}

/**
 * Fetch the user's verified email from GitHub given an OAuth access token.
 * Requires the token to have permission to read user emails (user:email scope for private emails).
 * 
 * Enterprise features:
 * - Rate limit detection and handling
 * - Token validation
 * - Retry logic with exponential backoff
 * - Structured error responses
 */
export async function getVerifiedEmailFromToken(
	token: string,
	retryCount = 0,
	maxRetries = 2
): Promise<EmailFetchResult> {
	const maxDelay = 2000; // 2 seconds max delay
	
	try {
		const resp = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `token ${token}`,
				Accept: 'application/vnd.github+json',
				'User-Agent': 'OpenKPIs',
			},
			cache: 'no-store',
		});

		// Handle rate limiting (429 Too Many Requests)
		if (resp.status === 429) {
			const rateLimitReset = resp.headers.get('X-RateLimit-Reset');
			const resetTime = rateLimitReset ? parseInt(rateLimitReset, 10) * 1000 : undefined;
			
			console.warn('[GitHub Email] Rate limited', {
				resetTime: resetTime ? new Date(resetTime).toISOString() : 'unknown',
			});
			
			// Retry if we have retries left and know when limit resets
			if (retryCount < maxRetries && resetTime) {
				const delay = Math.min(resetTime - Date.now(), maxDelay);
				if (delay > 0) {
					await new Promise((resolve) => setTimeout(resolve, delay));
					return getVerifiedEmailFromToken(token, retryCount + 1, maxRetries);
				}
			}
			
			return {
				email: null,
				error: 'rate_limited',
				rateLimitReset: resetTime,
			};
		}

		// Handle authentication errors (401 Unauthorized)
		if (resp.status === 401) {
			console.warn('[GitHub Email] Token invalid or expired (401)');
			return {
				email: null,
				error: 'token_invalid',
			};
		}

		// Handle forbidden (403) - likely missing scope
		if (resp.status === 403) {
			console.warn('[GitHub Email] Forbidden - likely missing user:email scope (403)');
			return {
				email: null,
				error: 'scope_missing',
			};
		}

		// Handle other API errors
		if (!resp.ok) {
			console.error('[GitHub Email] GitHub API error:', {
				status: resp.status,
				statusText: resp.statusText,
			});
			
			// Retry on 5xx errors
			if (resp.status >= 500 && retryCount < maxRetries) {
				const delay = Math.min(1000 * Math.pow(2, retryCount), maxDelay);
				await new Promise((resolve) => setTimeout(resolve, delay));
				return getVerifiedEmailFromToken(token, retryCount + 1, maxRetries);
			}
			
			return {
				email: null,
				error: 'api_error',
			};
		}

		const emails = (await resp.json()) as GitHubEmail[];
		if (!Array.isArray(emails) || emails.length === 0) {
			console.warn('[GitHub Email] No emails returned from GitHub API');
			return {
				email: null,
				error: 'api_error',
			};
		}

		// Find primary verified email first
		const primaryVerified = emails.find((e) => e.primary && e.verified);
		if (primaryVerified?.email) {
			return { email: primaryVerified.email };
		}

		// Fall back to any verified email
		const anyVerified = emails.find((e) => e.verified);
		if (anyVerified?.email) {
			return { email: anyVerified.email };
		}

		// No verified emails found
		console.warn('[GitHub Email] No verified emails found in response');
		return {
			email: null,
			error: 'api_error',
		};
	} catch (error) {
		// Network errors - retry with exponential backoff
		if (retryCount < maxRetries && error instanceof Error) {
			const delay = Math.min(1000 * Math.pow(2, retryCount), maxDelay);
			console.warn(`[GitHub Email] Network error, retrying in ${delay}ms:`, error.message);
			await new Promise((resolve) => setTimeout(resolve, delay));
			return getVerifiedEmailFromToken(token, retryCount + 1, maxRetries);
		}
		
		console.error('[GitHub Email] Network error:', error);
		return {
			email: null,
			error: 'network_error',
		};
	}
}


