import * as React from 'react';

import { Subject, Subscription } from './utils/createSubject';

type Props<T> = {
  disabled?: boolean;
  subject: Subject<T>;
  callback: (value: T) => void;
};

type Payload<T> = {
  _subscription: React.MutableRefObject<Subscription | undefined>;
  _props: React.MutableRefObject<Props<T>>;
};

const tearDown = (
  _subscription: React.MutableRefObject<Subscription | undefined>,
) => {
  if (_subscription.current) {
    _subscription.current.unsubscribe();
    _subscription.current = undefined;
  }
};

const updateSubscriptionProps = <T>({ _subscription, _props }: Payload<T>) => {
  if (_props.current.disabled) {
    tearDown(_subscription);
  } else if (!_subscription.current) {
    _subscription.current = _props.current.subject.subscribe({
      next: _props.current.callback,
    });
  }
};

export function useSubscribe<T>(props: Props<T>) {
  const _subscription = React.useRef<Subscription>();
  const _props = React.useRef(props);
  _props.current = props;

  updateSubscriptionProps({
    _subscription,
    _props,
  });

  React.useEffect(() => {
    updateSubscriptionProps({
      _subscription,
      _props,
    });

    return () => tearDown(_subscription);
  }, []);
}
