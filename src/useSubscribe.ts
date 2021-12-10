import React from 'react';

import { Subject, Subscription } from './utils/createSubject';

type Props<T> = {
  disabled?: boolean;
  subject: Subject<T>;
  callback: (value: T) => void;
};

export function useSubscribe<T>(props: Props<T>) {
  const _props = React.useRef(props);
  _props.current = props;

  React.useEffect(() => {
    const tearDown = (subscription: Subscription | false) => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };

    const subscription =
      !props.disabled &&
      _props.current.subject.subscribe({
        next: _props.current.callback,
      });

    return () => tearDown(subscription);
  }, [props.disabled]);
}
