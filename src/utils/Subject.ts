export type Observer<T> = {
  next: (value: T) => void;
};

type TearDown = () => void;

export type SubjectType<T> = {
  next: (value: T) => void;
  subscribe: (value: Observer<T>) => {
    unsubscribe: TearDown;
  };
};

export class Subscription {
  private tearDowns: TearDown[] = [];

  add(tearDown: TearDown) {
    this.tearDowns.push(tearDown);
  }

  unsubscribe() {
    for (const teardown of this.tearDowns) {
      teardown();
    }
    this.tearDowns = [];
  }
}

class Subscriber<T> implements Observer<T> {
  closed = false;

  constructor(private observer: Observer<T>, subscription: Subscription) {
    subscription.add(() => (this.closed = true));
  }

  next(value: T) {
    if (!this.closed) {
      this.observer.next(value);
    }
  }
}

export default class Subject<T> {
  observers: Observer<T>[];

  constructor() {
    this.observers = [];
  }

  next(value: T) {
    for (const observer of this.observers) {
      observer.next(value);
    }
  }

  subscribe(observer: Observer<T>) {
    const subscription = new Subscription();
    const subscriber = new Subscriber(observer, subscription);
    this.observers.push(subscriber);

    return subscription;
  }

  unsubscribe() {
    this.observers = [];
  }
}
