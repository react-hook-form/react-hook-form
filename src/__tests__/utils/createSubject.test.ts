import createSubject from '../../utils/createSubject';

describe('createSubject', () => {
  it('subscribe to all the correct observer', () => {
    const subject = createSubject();
    const next = jest.fn();

    subject.subscribe({
      next,
    });

    subject.subscribe({
      next,
    });

    expect(subject.observers.length).toBe(2);

    subject.next(2);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenCalledWith(2);
  });

  it('unsubscribe observers', () => {
    const subject = createSubject();
    const next1 = jest.fn();
    const next2 = jest.fn();

    const subscription = subject.subscribe({
      next: next1,
    });

    subject.subscribe({
      next: next2,
    });

    expect(subject.observers.length).toBe(2);

    subscription.unsubscribe();

    expect(subject.observers.length).toBe(1);

    subject.next(2);

    expect(next1).not.toHaveBeenCalled();
    expect(next2).toHaveBeenCalledWith(2);
  });

  it('unsubscribe all observers', () => {
    const subject = createSubject();
    const next = jest.fn();

    subject.subscribe({
      next,
    });

    subject.subscribe({
      next,
    });

    expect(subject.observers.length).toBe(2);

    subject.unsubscribe();

    expect(subject.observers.length).toBe(0);

    subject.next(2);
    subject.next(2);

    expect(next).not.toHaveBeenCalled();
  });

  describe('during an active emission', () => {
    it('still deliver the current value to an observer unsubscribed by an earlier observer', () => {
      const subject = createSubject<number>();
      const later = jest.fn();
      let laterSubscription = { unsubscribe: () => {} };

      subject.subscribe({ next: () => laterSubscription.unsubscribe() });
      laterSubscription = subject.subscribe({ next: later });

      subject.next(1);
      subject.next(2);

      expect(later).toHaveBeenCalledTimes(1);
      expect(later).toHaveBeenCalledWith(1);
      expect(subject.observers.length).toBe(1);
    });

    it('let an observer unsubscribe itself', () => {
      const subject = createSubject<number>();
      const self = jest.fn();
      const after = jest.fn();
      const subscription = subject.subscribe({
        next: (value) => {
          self(value);
          subscription.unsubscribe();
        },
      });

      subject.subscribe({ next: after });

      subject.next(1);
      subject.next(2);

      expect(self).toHaveBeenCalledTimes(1);
      expect(after).toHaveBeenCalledTimes(2);
    });

    it('skip an observer unsubscribed before a nested emission', () => {
      const subject = createSubject<number>();
      const later = jest.fn();
      let laterSubscription = { unsubscribe: () => {} };

      subject.subscribe({
        next: (value) => {
          if (value === 1) {
            laterSubscription.unsubscribe();
            subject.next(2);
          }
        },
      });
      laterSubscription = subject.subscribe({ next: later });

      subject.next(1);

      expect(later).toHaveBeenCalledTimes(1);
      expect(later).toHaveBeenCalledWith(1);
    });

    it('deliver the current value to an observer subscribed during the emission', () => {
      const subject = createSubject<number>();
      const added = jest.fn();
      let subscribed = false;

      subject.subscribe({
        next: () => {
          if (!subscribed) {
            subscribed = true;
            subject.subscribe({ next: added });
          }
        },
      });

      subject.next(1);
      subject.next(2);

      expect(added).toHaveBeenCalledTimes(2);
      expect(added).toHaveBeenNthCalledWith(1, 1);
    });

    it('still deliver the current value to everyone after unsubscribing all', () => {
      const subject = createSubject<number>();
      const later = jest.fn();

      subject.subscribe({ next: () => subject.unsubscribe() });
      subject.subscribe({ next: later });

      subject.next(1);
      subject.next(2);

      expect(later).toHaveBeenCalledTimes(1);
      expect(subject.observers.length).toBe(0);
    });
  });

  it('deliver once to an observer object subscribed twice', () => {
    const subject = createSubject<number>();
    const next = jest.fn();
    const observer = { next };

    const first = subject.subscribe(observer);
    const second = subject.subscribe(observer);

    expect(subject.observers).toEqual([observer]);

    subject.next(1);

    expect(next).toHaveBeenCalledTimes(1);

    first.unsubscribe();

    expect(subject.observers.length).toBe(0);

    second.unsubscribe();
    subject.next(2);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('keep other observers after many unsubscribes', () => {
    const subject = createSubject<number>();
    const kept = jest.fn();
    const subscriptions = Array.from({ length: 100 }, () =>
      subject.subscribe({ next: jest.fn() }),
    );

    subject.subscribe({ next: kept });
    subscriptions.forEach((subscription) => subscription.unsubscribe());
    subscriptions[0].unsubscribe();

    subject.next(1);

    expect(kept).toHaveBeenCalledTimes(1);
    expect(subject.observers.length).toBe(1);
  });
});
