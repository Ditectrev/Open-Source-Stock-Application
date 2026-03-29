/**
 * Retry utility with exponential backoff
 * Implements retry logic with delays: 1s, 2s, 4s, 8s
 */

import { logger } from "./logger";

interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitterMs?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  baseDelayMs: 1000, // 1 second
  maxDelayMs: 8000, // 8 seconds
  jitterMs: 100, // Add up to 100ms random jitter
};

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  options: Required<RetryOptions>
): number {
  // Exponential backoff: 1s, 2s, 4s, 8s
  const exponentialDelay = options.baseDelayMs * Math.pow(2, attempt);
  const cappedDelay = Math.min(exponentialDelay, options.maxDelayMs);

  // Add jitter to prevent thundering herd
  const jitter = Math.random() * options.jitterMs;

  return cappedDelay + jitter;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  context: string,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      logger.debug("Retry attempt", {
        context,
        attempt: attempt + 1,
        maxAttempts: opts.maxAttempts,
      });
      const result = await fn();

      if (attempt > 0) {
        logger.info("Retry succeeded", { context, attempt: attempt + 1 });
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === opts.maxAttempts - 1) {
        logger.error("All retry attempts failed", lastError, {
          context,
          attempts: opts.maxAttempts,
        });
        break;
      }

      const delay = calculateDelay(attempt, opts);
      logger.warn("Retry attempt failed, backing off", {
        context,
        attempt: attempt + 1,
        maxAttempts: opts.maxAttempts,
        delayMs: Math.round(delay),
        error: lastError.message,
      });

      await sleep(delay);
    }
  }

  throw lastError || new Error("Retry failed with unknown error");
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const err = error as Record<string, unknown>;
  // Network errors
  if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
    return true;
  }

  // HTTP status codes that should be retried
  if (err.response && typeof err.response === "object") {
    const resp = err.response as Record<string, unknown>;
    if (typeof resp.status === "number") {
      // Retry on 5xx server errors and 429 rate limit
      return resp.status >= 500 || resp.status === 429;
    }
  }

  return false;
}

/**
 * Retry only if error is retryable
 */
export async function retryIfRetryable<T>(
  fn: () => Promise<T>,
  context: string,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (isRetryableError(error)) {
      logger.info("Retryable error detected, initiating retry", {
        context,
        error: error instanceof Error ? error.message : String(error),
      });
      return retryWithBackoff(fn, context, options);
    }
    throw error;
  }
}
