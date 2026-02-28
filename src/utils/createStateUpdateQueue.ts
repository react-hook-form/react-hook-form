/**
 * State Update Queue Utility
 * Batches state updates to prevent multiple re-renders
 */

import type { Subjects } from '../types';

export interface StateUpdate {
  data: any;
  isUrgent?: boolean;
}

export interface StateUpdateQueue<T> {
  enqueue: (update: Partial<T>, isUrgent?: boolean) => void;
  flush: () => void;
  clear: () => void;
  hasPendingUpdates: () => boolean;
}

/**
 * Creates a state update queue that batches updates and flushes them efficiently
 * @param subjects - The subjects to notify with state updates
 * @returns StateUpdateQueue interface
 */
export const createStateUpdateQueue = <T>(
  subjects: Subjects<any>,
): StateUpdateQueue<T> => {
  let pendingUpdates: Partial<T>[] = [];
  let isScheduled = false;
  let flushTimer: number | NodeJS.Timeout | null = null;

  /**
   * Merges multiple state updates into a single update object
   * Later updates override earlier ones for the same properties
   */
  const mergeUpdates = (updates: Partial<T>[]): Partial<T> => {
    return updates.reduce((merged, update) => ({
      ...merged,
      ...update,
    }), {} as Partial<T>);
  };

  /**
   * Schedules a flush operation
   */
  const scheduleFlush = (isUrgent: boolean = false) => {
    if (isScheduled && !isUrgent) return;

    // Clear any existing timer
    if (flushTimer) {
      clearTimeout(flushTimer as number);
      flushTimer = null;
    }

    if (isUrgent) {
      // Urgent updates flush immediately
      flush();
    } else {
      // Non-urgent updates are batched
      isScheduled = true;

      // Use queueMicrotask for batching
      queueMicrotask(() => {
        flush();
      });
    }
  };

  /**
   * Flushes all pending state updates
   */
  const flush = () => {
    if (pendingUpdates.length === 0) return;

    const updates = [...pendingUpdates];
    pendingUpdates = [];
    isScheduled = false;

    const mergedUpdate = mergeUpdates(updates);

    // Notify subscribers with the merged update
    subjects.state.next(mergedUpdate);
  };

  /**
   * Adds an update to the queue
   */
  const enqueue = (update: Partial<T>, isUrgent: boolean = false) => {
    pendingUpdates.push(update);
    scheduleFlush(isUrgent);
  };

  /**
   * Clears all pending updates
   */
  const clear = () => {
    pendingUpdates = [];
    isScheduled = false;
    if (flushTimer) {
      clearTimeout(flushTimer as number);
      flushTimer = null;
    }
  };

  /**
   * Checks if there are pending updates
   */
  const hasPendingUpdates = () => {
    return pendingUpdates.length > 0 || isScheduled;
  };

  return {
    enqueue,
    flush,
    clear,
    hasPendingUpdates,
  };
};