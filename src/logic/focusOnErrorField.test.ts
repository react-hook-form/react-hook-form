import focusErrorField from './focusOnErrorField';

jest.mock('../utils/isHTMLElement', () => ({
  default: () => true,
}));

describe('focusErrorField', () => {
  it('should focus on the first error it encounter', () => {
    const focus = jest.fn();
    focusErrorField(
      {
        test: {
          ref: {
            focus,
          } as any,
        },
      },
      {
        test: 'test' as any,
      },
    );

    expect(focus).toBeCalled();
  });

  it('should focus on first option when options input error encounters', () => {
    const focus = jest.fn();
    focusErrorField(
      {
        test: {
          ref: {} as any,
          options: [
            {
              ref: {
                focus,
              } as any,
            },
          ],
        },
      },
      {
        test: 'test' as any,
      },
    );

    expect(focus).toBeCalled();
  });

  it('should not call focus when field is undefined', () => {
    const focus = jest.fn();
    focusErrorField(
      {
        test: undefined,
      },
      {
        test: 'test' as any,
      },
    );

    expect(focus).not.toBeCalled();
  });
});
