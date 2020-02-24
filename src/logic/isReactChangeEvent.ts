import { ChangeEvent } from 'react';

function isNativeEvent(maybeEvent: any): maybeEvent is Event {
  return maybeEvent instanceof Event;
}

export default function isReactChangeEvent<HTMLElement = Element>(
  maybeEvent: any,
): maybeEvent is ChangeEvent<HTMLElement> {
  const event = maybeEvent as ChangeEvent;
  return (
    isNativeEvent(event.nativeEvent) &&
    event.constructor.name === 'SyntheticEvent' &&
    event.type === 'change'
  );
}
