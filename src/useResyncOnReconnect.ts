import React from 'react';

import cloneObject from './utils/cloneObject';
import deepEqual from './utils/deepEqual';

export function useResyncOnReconnect<T>(getInitialValue?: () => T) {
  const _connected = React.useRef(false);
  const _initialized = React.useRef(false);
  const _prevValue = React.useRef<T | undefined>(undefined);
  const _renderCount = React.useRef(0);

  _renderCount.current++;

  if (!_initialized.current && getInitialValue) {
    _initialized.current = true;
    _prevValue.current = cloneObject(getInitialValue());
  }

  const resyncIfNeeded = React.useCallback(
    (
      enabled: boolean,
      getCurrentValue: () => T,
      setValue: (value: T) => void,
    ) => {
      if (
        enabled &&
        (_connected.current ||
          (_initialized.current && _renderCount.current > 1))
      ) {
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
