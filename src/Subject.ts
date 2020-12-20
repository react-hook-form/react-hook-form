type Observer<T> = {
  next: (value?: T) => void;
  error?: (error: any) => void;
  complete?: () => void;
};
type TearDown = () => void;

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

  constructor(
    private observer: Observer<T>,
    private subscription: Subscription,
  ) {
    subscription.add(() => (this.closed = true));
  }

  next(value?: T) {
    if (!this.closed) {
      this.observer.next(value);
    }
  }

  error(error: any) {
    if (!this.closed && this.observer.error) {
      this.observer.error(error);
      this.subscription.unsubscribe();
    }
  }

  complete() {
    if (!this.closed) {
      this.complete();
      this.subscription.unsubscribe();
    }
  }
}

// export class Observable<T> {
//   constructor(private init: (observer: Observer<T>) => TearDown) {}
//
//   subscribe(observer: Observer<T>): Subscription {
//     const subscription = new Subscription();
//     const subscriber = new Subscriber(observer, subscription);
//     subscription.add(this.init(subscriber));
//
//     return subscription;
//   }
// }

export default class Subject<T> {
  observers: Observer<T>[];

  constructor() {
    this.observers = [];
  }

  next(value?: T) {
    this.observers.forEach((observer) => {
      observer.next(value);
    });
  }

  subscribe(observer: Observer<T>) {
    const subscription = new Subscription();
    const subscriber = new Subscriber(observer, subscription);
    this.observers.push(subscriber);

    return subscription;
  }
}
