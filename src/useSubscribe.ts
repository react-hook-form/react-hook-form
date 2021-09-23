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
  const _isSubscribed = React.useRef(false);

  if (disabled) {
    if (_subscription.current) {
      _unSubscribe.current && _unSubscribe.current.unsubscribe();
      _subscription.current = _unSubscribe.current = undefined;
      _isSubscribed.current = false;
    }
  } else {
    if (!_subscription.current) {
      _subscription.current = subject;
    }

    if (!_isSubscribed.current) {
      if (_subscription.current) {
        _unSubscribe.current = _subscription.current.subscribe({
          next: callback,
        });
      }
      _isSubscribed.current = true;
    }
  }

  React.useEffect(
    () => () => {
      _unSubscribe.current && _unSubscribe.current.unsubscribe();
    },
    [],
  );
}
