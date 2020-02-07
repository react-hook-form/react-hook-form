// @ts-nocheck
import focusErrorField from './focusErrorField';

jest.mock('../utils/isHTMLElement', () => ({
  default: () => true,
}));

test('should focus on the first error it encounter', () => {
  const focus = jest.fn();
  focusErrorField(
    {
      test: {
        ref: {
          focus,
        },
      },
    },
    {
      test: 'test',
    },
  );

  expect(focus).toBeCalled();
});

test('should focus on first option when options input error encounters', () => {
  const focus = jest.fn();
  focusErrorField(
    {
      test: {
        ref: {},
        options: [
          {
            ref: {
              focus,
            },
          },
        ],
      },
    },
    {
      test: 'test',
    },
  );

  expect(focus).toBeCalled();
});
