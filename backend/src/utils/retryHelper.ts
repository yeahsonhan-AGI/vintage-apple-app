/**
 * Retry helper utility for API calls with exponential backoff
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * Default retry predicate - retry on network errors and 5xx server errors
 */
export const defaultShouldRetry = (error: any): boolean => {
  // Retry on network errors
  if (!error.response && error.message) {
    return true;
  }

  // Retry on 5xx server errors
  if (error.response?.status >= 500) {
    return true;
  }

  // Retry on 429 (rate limit)
  if (error.response?.status === 429) {
    return true;
  }

  // Retry on 408 (request timeout)
  if (error.response?.status === 408) {
    return true;
  }

  return false;
};

/**
 * Sleep utility for delaying execution
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry an async operation with exponential backoff
 *
 * @param operation - The async function to retry
 * @param options - Retry configuration options
 * @returns Promise with the result of the operation
 * @throws The last error if all retries are exhausted
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000, // 1 second
    maxDelay = 10000, // 10 seconds
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry
  } = options;

  let lastError: any;
  let currentDelay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Attempt the operation
      const result = await operation();

      // If successful and not the first attempt, log recovery
      if (attempt > 0) {
        console.log(`Retry successful on attempt ${attempt + 1}`);
      }

      return result;

    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (attempt < maxRetries && shouldRetry(error)) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(
          `Operation failed (attempt ${attempt + 1}/${maxRetries + 1}): ${errorMessage}`
        );
        console.warn(`Retrying in ${currentDelay}ms...`);

        // Wait before retrying
        await sleep(currentDelay);

        // Calculate next delay with exponential backoff
        currentDelay = Math.min(
          currentDelay * backoffMultiplier,
          maxDelay
        );

        // Add some jitter to avoid thundering herd
        const jitter = Math.random() * 500; // Up to 500ms jitter
        currentDelay = Math.min(currentDelay + jitter, maxDelay);

      } else {
        // Either max retries reached or error is not retryable
        break;
      }
    }
  }

  // All retries exhausted
  console.error(`Operation failed after ${maxRetries + 1} attempts`);
  throw lastError;
}

/**
 * Create a timeout promise that rejects after specified time
 */
export function createTimeoutPromise<T>(
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });
}

/**
 * Run an operation with a timeout
 */
export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    operation,
    createTimeoutPromise<T>(timeoutMs, errorMessage)
  ]);
}
