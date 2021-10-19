import { Noop } from '../types';

export type Observer<TValue> = {
  next: (value: TValue) => void;
};

export type TearDown = Noop;

export type Subscription = {
  unsubscribe: TearDown;
};

export type SubjectType<TValue> = {
  next: (value: TValue) => void;
  subscribe: (value: Observer<TValue>) => Subscription;
};

export default function createSubject<TValue>(): SubjectType<TValue> {
  let observers: Observer<TValue>[] = [];

  return {
    subscribe(observer: Observer<TValue>) {
      observers.push(observer);
      return {
        unsubscribe() {
          observers = observers.filter((l) => l !== observer);
        },
      };
    },
    next(value: TValue) {
      observers.forEach((observer) => observer.next(value));
    },
  };
}
