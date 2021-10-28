import * as React from 'react';

import { Subject, Subscription } from './utils/createSubject';
import { Noop } from './types';

type Props<T> = {
  disabled?: boolean;
  subject: Subject<T>;
  callback: (value: T) => void;
};

type Payload<T> = {
  _subscription: React.MutableRefObject<Subscription | undefined>;
  props: Props<T>;
};

const tearDown = (
  _subscription: React.MutableRefObject<Subscription | undefined>,
) => {
  if (_subscription.current) {
    _subscription.current.unsubscribe();
    _subscription.current = undefined;
  }
};

const updateSubscriptionProps =
  <T>({ _subscription, props }: Payload<T>) =>
  () => {
    if (props.disabled) {
      tearDown(_subscription);
    } else if (!_subscription.current) {
      _subscription.current = props.subject.subscribe({
        next: props.callback,
      });
    }
  };

export function useSubscribe<T>(props: Props<T>) {
  const _subscription = React.useRef<Subscription>();
  const _updateSubscription = React.useRef<Noop>(() => {});

  _updateSubscription.current = updateSubscriptionProps({
    _subscription,
    props,
  });

  _updateSubscription.current();

  React.useEffect(() => {
    _updateSubscription.current();
    return () => tearDown(_subscription);
  }, []);
}
