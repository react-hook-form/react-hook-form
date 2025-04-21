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

  it('should focus on the first error it encounter and not the second', () => {
    const focus = jest.fn();
    iterateFieldsByAction(
      {
        first: {
          _f: {
            name: 'first',
            ref: {
              name: 'first',
              focus,
            },
          },
        },
        second: {
          _f: {
            name: 'second',
            ref: {
              name: 'second',
              focus,
            },
          },
        },
      },
      (ref) => {
        // @ts-expect-error we want to test with what focus was called
        ref.focus && ref.focus(ref.name);
        return 1;
      },
    );
    expect(focus).toBeCalledWith('first');
    expect(focus).not.toBeCalledWith('second');
  });

  it('should recursively drill into objects', () => {
    const focus = jest.fn();
    iterateFieldsByAction(
      {
        test: {
          name: {
            first: {
              _f: {
                name: 'name.first',
                ref: {
                  name: 'first',
                  focus,
                },
              },
            },
            last: {
              _f: {
                name: 'name.last',
                ref: {
                  name: 'last',
                  focus,
                },
              },
            },
          },
        },
      },
      (ref, key) => {
        if (key === 'name.last') {
          // @ts-expect-error we want to test with what focus was called
          ref.focus && ref.focus(ref.name);
          return 1;
        }
        return;
      },
    );
    expect(focus).not.toBeCalledWith('first');
    expect(focus).toBeCalledWith('last');
  });

  it('should should recursively drill into objects and break out of all loops on first focus', () => {
    const focus = jest.fn();
    const notFocus = jest.fn();
    iterateFieldsByAction(
      {
        personal: {
          name: {
            first: {
              _f: {
                name: 'name.first',
                ref: {
                  name: 'first',
                  focus: notFocus,
                },
              },
            },
            last: {
              _f: {
                name: 'name.last',
                ref: {
                  name: 'last',
                  focus,
                },
              },
            },
          },
          phone: {
            _f: {
              name: 'phone',
              ref: {
                name: 'phone',
                focus: notFocus,
              },
            },
          },
          address: {
            line1: {
              _f: {
                name: 'address.line1',
                ref: {
                  name: 'line1',
                  focus: notFocus,
                },
              },
            },
          },
        },
      },
      (ref, key) => {
        // @ts-expect-error we want to test with what focus was called
        ref.focus && ref.focus(ref.name);
        return key === 'name.last' ? 1 : undefined;
      },
    );
    // 'focus' should be called on 'last' and never again
    expect(focus).not.toBeCalledWith('first'); // not valid
    expect(focus).toBeCalledWith('last'); // valid
    expect(focus).not.toBeCalledWith('phone'); // stopped
    expect(focus).not.toBeCalledWith('line1');
    // 'notFocus' should be called on the first, then never again
    expect(notFocus).toBeCalledWith('first'); // not valid
    expect(notFocus).not.toBeCalledWith('last'); // valid
    expect(notFocus).not.toBeCalledWith('phone'); // stopped
    expect(notFocus).not.toBeCalledWith('line1');
  });
});
