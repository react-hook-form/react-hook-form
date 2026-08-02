import React from 'react';

import cloneObject from './utils/cloneObject';
import deepEqual from './utils/deepEqual';

/**
 * React's `<Activity mode="hidden">` tears down effects for a hidden subtree
 * (dropping any RHF subscription) and re-runs them when it becomes visible
 * again. Anything published while no one was subscribed is missed, leaving
 * the subtree's React state stale. This tracks the value seen at disconnect
 * time so a hook's own effect can resync from the live source of truth
 * before resubscribing, and is a no-op across a plain mount (nothing to
 * resync against yet) or a normal update (the subscription never dropped).
 */
export function useResyncOnReconnect<T>() {
  const _connected = React.useRef(false);
  const _prevValue = React.useRef<T | undefined>(undefined);

  const resyncIfNeeded = React.useCallback(
    (
      enabled: boolean,
      getCurrentValue: () => T,
      setValue: (value: T) => void,
    ) => {
      if (enabled && _connected.current) {
        const currentValue = getCurrentValue();

        if (!deepEqual(_prevValue.current, currentValue)) {
          setValue(currentValue);
        }
      }

      _connected.current = true;
    },
    [],
  );

  const snapshot = React.useCallback(
    (enabled: boolean, getCurrentValue: () => T) => {
      if (enabled) {
        _prevValue.current = cloneObject(getCurrentValue());
      }
    },
    [],
  );

  return { resyncIfNeeded, snapshot };
}
