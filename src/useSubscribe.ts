import * as React from 'react';

import { Subject, Subscription } from './utils/createSubject';
import { Noop } from './types';

type Props<T> = {
  disabled?: boolean;
  subject: Subject<T>;
  callback: (value: T) => void;
  skipEarlySubscription?: boolean;
};

type Payload<T> = {
  _unsubscribe: React.MutableRefObject<Subscription | undefined>;
  props: Props<T>;
};

const tearDown = (
  _unsubscribe: React.MutableRefObject<Subscription | undefined>,
) => {
  if (_unsubscribe.current) {
    _unsubscribe.current.unsubscribe();
    _unsubscribe.current = undefined;
  }
};

const updateSubscriptionProps =
  <T>({ _unsubscribe, props }: Payload<T>) =>
  () => {
    if (props.disabled) {
      tearDown(_unsubscribe);
    } else if (!_unsubscribe.current) {
      _unsubscribe.current = props.subject.subscribe({
        next: props.callback,
      });
    }
  };

export function useSubscribe<T>(props: Props<T>) {
  const _unsubscribe = React.useRef<Subscription>();
  const _updateSubscription = React.useRef<Noop>(() => {});

  _updateSubscription.current = updateSubscriptionProps({
    _unsubscribe,
    props,
  });

  !props.skipEarlySubscription && _updateSubscription.current();

  React.useEffect(() => {
    _updateSubscription.current();
    return () => tearDown(_unsubscribe);
  }, []);
}
