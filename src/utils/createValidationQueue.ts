/**
 * Validation Queue Utility
 * Implements a queue system that batches validation requests and flushes them in a microtask
 * This prevents race conditions and state updates during render
 */

export type ValidationCallback = () => Promise<void>;

export interface ValidationQueueOptions {
  onFlush?: () => void;
  onError?: (error: Error) => void;
}

export interface ValidationQueue {
  enqueue: (fieldName?: string) => void;
  flush: () => Promise<void>;
  clear: () => void;
  isQueued: () => boolean;
  getPendingFields: () => Set<string>;
}

/**
 * Creates a validation queue that batches validation requests and executes them in a microtask
 * @param validationFn - The validation function to execute
 * @param options - Queue configuration options
 * @returns ValidationQueue interface for managing validation
 */
export const createValidationQueue = (
  validationFn: ValidationCallback,
  options: ValidationQueueOptions = {},
): ValidationQueue => {
  let pendingFields = new Set<string>();
  let flushPromise: Promise<void> | null = null;
  let isScheduled = false;

  /**
   * Schedules a flush operation in the next microtask
   * Uses queueMicrotask for optimal timing after render completes
   */
  const scheduleFlush = () => {
    if (isScheduled) return;

    isScheduled = true;

    // Use queueMicrotask to ensure execution after current render
    queueMicrotask(async () => {
      await flush();
    });
  };

  /**
   * Executes the queued validation
   */
  const flush = async (): Promise<void> => {
    if (!isScheduled && pendingFields.size === 0) return;

    // Prevent duplicate flush operations
    if (flushPromise) return flushPromise;

    // Create a new flush operation
    flushPromise = (async () => {
      try {
        const fieldsToValidate = new Set(pendingFields);
        pendingFields.clear();
        isScheduled = false;

        // Notify that flush is starting
        options.onFlush?.();

        // Execute validation
        if (fieldsToValidate.size > 0 || isScheduled) {
          await validationFn();
        }
      } catch (error) {
        // Handle validation errors
        if (options.onError) {
          options.onError(error as Error);
        } else {
          console.error('Validation queue error:', error);
        }
      } finally {
        flushPromise = null;
      }
    })();

    return flushPromise;
  };

  /**
   * Adds a field to the validation queue
   * @param fieldName - Optional field name to track
   */
  const enqueue = (fieldName?: string) => {
    if (fieldName) {
      pendingFields.add(fieldName);
    }
    scheduleFlush();
  };

  /**
   * Clears the queue without executing
   */
  const clear = () => {
    pendingFields.clear();
    isScheduled = false;
    flushPromise = null;
  };

  /**
   * Checks if there are pending validations
   */
  const isQueued = () => {
    return isScheduled || pendingFields.size > 0;
  };

  /**
   * Returns the set of pending fields
   */
  const getPendingFields = () => {
    return new Set(pendingFields);
  };

  return {
    enqueue,
    flush,
    clear,
    isQueued,
    getPendingFields,
  };
};