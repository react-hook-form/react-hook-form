import React from 'react';

import cloneObject from './utils/cloneObject';
import deepEqual from './utils/deepEqual';

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
