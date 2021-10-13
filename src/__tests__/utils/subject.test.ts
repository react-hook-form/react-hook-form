import Subject from '../../utils/subject';

describe('Subject', () => {
  it('should subscribe to all the correct observer', () => {
    const subject = new Subject();
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
    const subject = new Subject();
    const next = jest.fn();

    const tearDown = subject.subscribe({
      next,
    });

    const tearDown1 = subject.subscribe({
      next,
    });

    tearDown.unsubscribe();

    tearDown1.unsubscribe();

    subject.next(2);
    subject.next(2);

    expect(next).not.toBeCalled();
  });
});
