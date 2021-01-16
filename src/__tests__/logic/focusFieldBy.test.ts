import focusFieldBy from '../../logic/focusFieldBy';
import get from '../../utils/get';

jest.mock('../../utils/isHTMLElement', () => ({
  default: () => true,
}));

describe('focusFieldBy', () => {
  it('should focus on the first error it encounter', () => {
    const focus = jest.fn();
    focusFieldBy(
      {
        test: {
          __field: {
            name: 'test',
            ref: {
              name: 'test',
              focus,
            },
          },
        },
      },
      (key) =>
        get(
          {
            test: {
              message: 'test',
              type: 'required',
            },
          },
          key,
        ),
    );

    expect(focus).toBeCalled();
  });

  it('should focus on first option when options input error encounters', () => {
    const focus = jest.fn();
    focusFieldBy(
      {
        test: {
          __field: {
            name: 'test',
            ref: {
              name: 'test',
            },
            refs: [
              // @ts-expect-error
              {
                focus,
              },
            ],
          },
        },
      },
      (key) =>
        get(
          {
            test: {
              message: 'test',
              type: 'required',
            },
          },
          key,
        ),
    );

    expect(focus).toBeCalled();
  });

  it('should not call focus when field is undefined', () => {
    expect(() => {
      focusFieldBy(
        {
          test: undefined,
        },
        (key) =>
          get(
            {
              test: {
                message: 'test',
                type: 'required',
              },
            },
            key,
          ),
      );
    }).not.toThrow();
  });
});
