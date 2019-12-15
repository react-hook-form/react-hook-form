import mergeErrors from './mergeErrors';

test('should merge errors', () => {
  const errors = {
    test: {
      data: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
    },
  };
  const anotherError = {
    test: {
      data2: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
      data1: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
    },
    test2: {
      data: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
      data1: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
    },
  };

  expect(mergeErrors(errors, anotherError)).toEqual({
    test: {
      data: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
      data1: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
      data2: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
    },
    test2: {
      data: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
      data1: {
        type: 'test',
        types: undefined,
        message: undefined,
        ref: {},
        isManual: true,
      },
    },
  });
});

test('should merge empty {} as source', () => {
  expect(
    mergeErrors(
      {},
      {
        input: {
          type: 'test',
          types: undefined,
          message: undefined,
          ref: {},
          isManual: true,
        },
      },
    ),
  ).toEqual({
    input: {
      type: 'test',
      types: undefined,
      message: undefined,
      ref: {},
      isManual: true,
    },
  });
});
