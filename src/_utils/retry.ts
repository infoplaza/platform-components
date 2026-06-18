export interface RetryOptions {
  /** Number of retries after the initial attempt. Default: 2 (3 total attempts) */
  retries?: number;
  /** Base delay in milliseconds before the first retry. Default: 100 */
  delayMs?: number;
  /** Exponential backoff multiplier. Set to 1 for fixed delays. Default: 2 */
  factor?: number;
  /** Optional abort signal. Cancels any pending delay and stops further retries. */
  signal?: AbortSignal;
  /** Predicate to decide whether an error should trigger a retry. Default: retry all except AbortError. */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Hook called before each retry. Useful for logging. */
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

const DEFAULT_RETRIES = 2;
const DEFAULT_DELAY_MS = 100;
const DEFAULT_FACTOR = 2;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function defaultShouldRetry(error: unknown): boolean {
  return !isAbortError(error);
}

function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException('Aborted', 'AbortError');
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortReason(signal));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortReason(signal!));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, {once: true});
  });
}

/**
 * Run an async function with automatic retries and exponential backoff.
 *
 * Defaults: 2 retries, 100ms base delay, factor 2 → delays 100ms, 200ms.
 *
 * @example
 * await retry(() => fetch(url), {retries: 2, delayMs: 100, signal});
 */
export async function retry<T>(fn: (attempt: number) => Promise<T>, options?: RetryOptions): Promise<T> {
  const retries = options?.retries ?? DEFAULT_RETRIES;
  const baseDelay = options?.delayMs ?? DEFAULT_DELAY_MS;
  const factor = options?.factor ?? DEFAULT_FACTOR;
  const signal = options?.signal;
  const shouldRetry = options?.shouldRetry ?? defaultShouldRetry;
  const onRetry = options?.onRetry;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal?.aborted) {
      throw abortReason(signal);
    }
    try {
      return await fn(attempt);
    } catch (error) {
      const hasMore = attempt < retries;
      if (!hasMore || !shouldRetry(error, attempt)) {
        throw error;
      }
      const wait = baseDelay * Math.pow(factor, attempt);
      onRetry?.(error, attempt, wait);
      await delay(wait, signal);
    }
  }

  // unreachable: the loop either returns or throws
  throw new Error('retry: unreachable');
}
