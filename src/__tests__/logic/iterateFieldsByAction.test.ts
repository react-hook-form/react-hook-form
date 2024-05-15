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

  it('should call action on all refs when `iterateRefs` is true', () => {
    const action = jest.fn(() => 1 as const);
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
                value: '1',
              },
              {
                value: '2',
              },
              {
                value: '3',
              },
            ] as unknown as HTMLInputElement[],
          },
        },
      },
      action,
      0,
      true,
      true,
    );
    expect(action).toHaveBeenCalledTimes(3);
  });

  it('should call action on first ref only when `iterateRefs` is false', () => {
    const action = jest.fn(() => 1 as const);
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
                value: '1',
              },
              {
                value: '2',
              },
              {
                value: '3',
              },
            ] as unknown as HTMLInputElement[],
          },
        },
      },
      action,
      0,
      true,
      false,
    );

    expect(action).toHaveBeenCalledTimes(1);
    expect(action).toHaveBeenCalledWith({ value: '1' }, 'test');
  });
});
