/**
 * Implementation of an observable pattern.
 * This pattern is used for implementing
 * a publisher-subscriber system, where subscribers (observers)
 * can listen to events or data changes
 * emitted by a subject (observable).
 */
import { Noop } from '../types';

/**
 * Observer that has a next method.
 * This method is called when new data is emitted.
 */
export type Observer<T> = {
  next: (value: T) => void;
};
/**
 * A type representing a subscription that
 * has an unsubscribe method. This method is used
 * to stop receiving updates from the subject.
 */
export type Subscription = {
  unsubscribe: Noop;
};

/**
 * A type representing a subject that can be observed.
 * It has an array of observers, methods to subscribe
 * and unsubscribe observers, and a method to
 * emit data to all observers.
 */
export type Subject<T> = {
  readonly observers: Observer<T>[];
  subscribe: (value: Observer<T>) => Subscription;
  unsubscribe: Noop;
} & Observer<T>;

export default function createSubject<T>(): Subject<T> {
  let _observers: Observer<T>[] = [];

  const next = (value: T) => {
    for (const observer of _observers) {
      observer.next && observer.next(value);
    }
  };

  const subscribe = (observer: Observer<T>): Subscription => {
    _observers.push(observer);
    return {
      unsubscribe: () => {
        _observers = _observers.filter((o) => o !== observer);
      },
    };
  };

  const unsubscribe = () => {
    _observers = [];
  };

  return {
    get observers() {
      return _observers;
    },
    next,
    subscribe,
    unsubscribe,
  };
}
