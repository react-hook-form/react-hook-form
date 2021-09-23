import * as React from 'react';

import { SubjectType, TearDown } from './utils/Subject';

type Props<T> = {
  disabled?: boolean;
  subject?: SubjectType<T>;
  callback: (value: T) => void;
};

export function useSubscribe<T>({ disabled, subject, callback }: Props<T>) {
  const _subscription = React.useRef(subject);
  const _unSubscribe = React.useRef<{ unsubscribe: TearDown }>();

  if (disabled) {
    if (_subscription.current) {
      _unSubscribe.current && _unSubscribe.current.unsubscribe();
      _subscription.current = _unSubscribe.current = undefined;
    }
  } else {
    if (!_subscription.current) {
      _subscription.current = subject;
    }

    if (!_unSubscribe.current) {
      if (_subscription.current) {
        _unSubscribe.current = _subscription.current.subscribe({
          next: callback,
        });
      }
    }
  }

  React.useEffect(
    () => () => {
      _unSubscribe.current && _unSubscribe.current.unsubscribe();
    },
    [],
  );
}
