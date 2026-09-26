import type { Noop } from '../types';

export type Observer<T> = {
  next: (value: T) => void;
};

export type Subscription = {
  unsubscribe: Noop;
};

export type Subject<T> = {
  readonly observers: Observer<T>[];
  subscribe: (value: Observer<T>) => Subscription;
  unsubscribe: Noop;
} & Observer<T>;

export default <T>(): Subject<T> => {
  let _observers = new Set<Observer<T>>();
  let _iterationCount = 0;

  const next = (value: T) => {
    const observers = _observers;

    _iterationCount++;

    for (const observer of observers) {
      observer.next && observer.next(value);
    }

    observers === _observers && _iterationCount--;
  };

  const subscribe = (observer: Observer<T>): Subscription => {
    _observers.add(observer);

    return {
      unsubscribe: () => {
        if (_iterationCount) {
          _observers = new Set(_observers);
          _iterationCount = 0;
        }

        _observers.delete(observer);
      },
    };
  };

  const unsubscribe = () => {
    _observers = new Set();
    _iterationCount = 0;
  };

  return {
    get observers() {
      return Array.from(_observers);
    },
    next,
    subscribe,
    unsubscribe,
  };
};
