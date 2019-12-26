import unset from './unset';

test('should unset the object', () => {
  const test = {
    data: {
      firstName: 'test',
      clear: undefined,
      test: [{ data1: '' }, { data2: '' }],
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

  expect(unset(test, ['data.firstName', 'data.test[0]'])).toEqual({
    data: {
      test: [undefined, { data2: '' }],
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

it('should unset multiple path', () => {
  const test = {
    data: {
      firstName: 'test',
      clear: undefined,
      quick: {
        test: undefined,
        what: 'test',
        test1: {
          ref: {
            test: '',
          },
        },
      },
    },
  };

  expect(unset(test, ['data.firstName', 'data.quick.test1'])).toEqual({
    data: {
      quick: {
        what: 'test',
      },
    },
  });
});

it('should return undefined when object is empty', () => {
  const test = {
    data: {
      firstName: {},
    },
  };

  expect(unset(test, ['data.firstName'])).toEqual({});
});
