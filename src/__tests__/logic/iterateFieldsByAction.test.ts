import iterateFieldsByAction from '../../logic/iterateFieldsByAction';

describe('iterateFieldsByAction', () => {
  it('should focus on the first error it encounter', () => {
    const focus = jest.fn();
    iterateFieldsByAction(
      {
        test: {
          _f: {
            name: 'test',
            ref: {
              name: 'test',
              focus,
            },
          },
        },
      },
      (ref) => {
        ref.focus && ref.focus();
        return 1;
      },
    );

    expect(focus).toBeCalled();
  });

  it('should focus on first option when options input error encounters', () => {
    const focus = jest.fn();
    iterateFieldsByAction(
      {
        test: {
          _f: {
            name: 'test',
            ref: {
              name: 'test',
            },
            refs: [
              {
                focus,
              } as unknown as HTMLInputElement,
            ],
          },
        },
      },
      (ref) => {
        ref.focus && ref.focus();
        return 1;
      },
    );

    expect(focus).toBeCalled();
  });

  it('should not call focus when field is undefined', () => {
    expect(() => {
      iterateFieldsByAction(
        {
          test: undefined,
        },
        (ref) => {
          ref.focus && ref.focus();
          return 1;
        },
      );
    }).not.toThrow();
  });
});
