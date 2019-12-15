import unset from './unset';

test('should unset the object', () => {
  const test = {
    data: {
      firstName: 'test',
      clear: undefined,
      data: {
        test: undefined,
        test1: {
          ref: {
            test: '',
          },
        },
      },
    },
  };

  expect(unset(test, 'data.firstName')).toEqual({
    data: {
      data: {
        test1: {
          ref: {
            test: '',
          },
        },
      },
    },
  });
});
