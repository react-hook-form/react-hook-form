import React from 'react';

import cloneObject from './utils/cloneObject';
import deepEqual from './utils/deepEqual';

export function useResyncOnReconnect<T>(getInitialValue?: () => T) {
  const _connected = React.useRef(false);
  const _initialized = React.useRef(false);
  const _prevValue = React.useRef<T | undefined>(undefined);
  const _renderCount = React.useRef(0);

  _renderCount.current++;

  // A subtree (e.g. a hidden React `Activity`) can render more than once
  // before its effects ever commit, and form values may change while it's
  // still disconnected. Seed the snapshot from render time so the first
  // effect run can detect that drift, but only trust it once more than one
  // render has actually happened first - an ordinary mount only ever
  // renders once before its effect commits, so this keeps ordinary mounts
  // from resyncing against transient, not-yet-mounted values.
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
