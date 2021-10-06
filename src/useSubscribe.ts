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
  const _callback = React.useRef(callback);

  const updateSubscription = React.useCallback(() => {
    if (!_subscription.current) {
      _subscription.current = subject;
    }

    if (!_unSubscribe.current && _subscription.current) {
      _unSubscribe.current = _subscription.current.subscribe({
        next: _callback.current,
      });
    }
  }, [subject]);

  updateSubscription();

  React.useEffect(() => {
    const tearDown = () => {
      _unSubscribe.current && _unSubscribe.current.unsubscribe();
      _subscription.current = _unSubscribe.current = undefined;
    };

    if (disabled) {
      tearDown();
    } else {
      updateSubscription();
    }

    return () => {
      tearDown();
    };
  }, [disabled, updateSubscription]);
}
