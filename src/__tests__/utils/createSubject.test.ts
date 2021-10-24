import createSubject from '../../utils/createSubject';

describe('createSubject', () => {
  it('should subscribe to all the correct observer', () => {
    const subject = createSubject();
    const next = jest.fn();

    subject.subscribe({
      next,
    });

    subject.subscribe({
      next,
    });

    subject.next(2);

    expect(next).toBeCalledTimes(2);
    expect(next).toBeCalledWith(2);
  });

  it('should unsubscribe observers', () => {
    const subject = createSubject();
    const next1 = jest.fn();
    const next2 = jest.fn();

    const subscription = subject.subscribe({
      next: next1,
    });

    subject.subscribe({
      next: next2,
    });

    subscription.unsubscribe();

    subject.next(2);

    expect(next1).not.toBeCalled();
    expect(next2).toBeCalledWith(2);
  });

  it('should unsubscribe all observers', () => {
    const subject = createSubject();
    const next = jest.fn();

    subject.subscribe({
      next,
    });

    subject.subscribe({
      next,
    });

    subject.unsubscribe();

    subject.next(2);
    subject.next(2);

    expect(next).not.toBeCalled();
  });
});
