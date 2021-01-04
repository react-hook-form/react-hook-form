import focusErrorField from './focusOnErrorField';

jest.mock('../utils/isHTMLElement', () => ({
  default: () => true,
}));

describe('focusErrorField', () => {
  it('should focus on the first error it encounter', () => {
    const focus = jest.fn();
    focusErrorField<{
      test: string;
    }>(
      {
        test: {
          name: 'test',
          ref: {
            name: 'test',
            focus,
          },
        },
      },
      {
        test: {
          message: 'test',
          type: 'required',
        },
      },
    );

    expect(focus).toBeCalled();
  });

  it('should focus on first option when options input error encounters', () => {
    const focus = jest.fn();
    focusErrorField<{
      test: string;
    }>(
      {
        test: {
          name: 'test',
          ref: {
            name: 'test',
          },
          refs: [
            {
              focus,
            } as any,
          ],
        },
      },
      {
        test: {
          message: 'test',
          type: 'required',
        },
      },
    );

    expect(focus).toBeCalled();
  });

  it('should not call focus when field is undefined', () => {
    expect(() => {
      focusErrorField<{
        test: string;
      }>(
        {
          test: undefined,
        },
        {
          test: {
            message: 'test',
            type: 'required',
          },
        },
      );
    }).not.toThrow();
  });
});
