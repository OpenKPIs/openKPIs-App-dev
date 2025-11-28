/**
 * Retry utility for handling transient failures
 * Enterprise-grade retry logic with exponential backoff
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryableErrors?: string[];
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry' | 'retryableErrors'>> & {
  retryableErrors: string[];
} = {
  maxAttempts: 3,
  initialDelayMs: 100,
  maxDelayMs: 2000,
  backoffMultiplier: 2,
  retryableErrors: [
    'network',
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'EAI_AGAIN',
  ],
};

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry configuration
 * @returns Result of the function
 * @throws Last error if all retries fail
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
    retryableErrors: options.retryableErrors || DEFAULT_OPTIONS.retryableErrors,
  };

  let lastError: unknown;
  let delay = opts.initialDelayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
      const isRetryable = opts.retryableErrors.some((retryable) =>
        errorMessage.includes(retryable.toLowerCase())
      );

      // Don't retry if:
      // - Not a retryable error
      // - Last attempt
      // - Error indicates permanent failure (e.g., validation error)
      if (!isRetryable || attempt === opts.maxAttempts) {
        throw error;
      }

      // Call retry callback if provided
      if (opts.onRetry) {
        opts.onRetry(attempt, error);
      }

      // Wait before retrying (exponential backoff)
      if (attempt < opts.maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Check if an error is retryable (transient failure)
 * Handles both generic errors and Supabase PostgrestError
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const retryablePatterns = [
    'network',
    'timeout',
    'econnreset',
    'etimedout',
    'enotfound',
    'eai_again',
    'connection',
    'temporary',
    'transient',
    'socket',
    'econnrefused',
    'econnaborted',
  ];

  // Check error message
  if (retryablePatterns.some((pattern) => message.includes(pattern))) {
    return true;
  }

  // Check Supabase PostgrestError codes
  // Type guard for PostgrestError-like objects
  const postgresError = error as { code?: string; details?: string };
  if (postgresError.code) {
    const code = postgresError.code.toLowerCase();
    // Retryable Postgres error codes
    const retryableCodes = [
      '08000', // connection_exception
      '08003', // connection_does_not_exist
      '08006', // connection_failure
      '08001', // sqlclient_unable_to_establish_sqlconnection
      '08004', // sqlserver_rejected_establishment_of_sqlconnection
      '57p01', // admin_shutdown
      '57p02', // crash_shutdown
      '57p03', // cannot_connect_now
      '53300', // too_many_connections
    ];
    if (retryableCodes.includes(code)) {
      return true;
    }
  }

  return false;
}

