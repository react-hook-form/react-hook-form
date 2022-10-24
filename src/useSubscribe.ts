import React from 'react';

import { Subject } from './utils/createSubject';

type Props<T> = {
  disabled?: boolean;
  subject: Subject<T>;
  callback: (value: T) => void;
};

export function useSubscribe<T>(props: Props<T>) {
  const _props = React.useRef(props);
  _props.current = props;

  React.useEffect(() => {
    const subscription =
      !props.disabled &&
      _props.current.subject.subscribe({
        next: _props.current.callback,
      });

    return () => {
      subscription && subscription.unsubscribe();
    };
  }, [props.disabled]);
}
