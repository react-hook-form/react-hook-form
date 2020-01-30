import focusErrorField from './focusErrorField';

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
      // @ts-ignore
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
      // @ts-ignore
      test: 'test',
    },
  );

  expect(focus).toBeCalled();
});
