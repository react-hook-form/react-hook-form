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
