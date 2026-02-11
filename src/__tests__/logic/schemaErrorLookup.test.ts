import schemaErrorLookup from '../../logic/schemaErrorLookup';

describe('errorsLookup', () => {
  it('should be able to look up the error', () => {
    expect(
      schemaErrorLookup<{
        test: {
          deep: string;
        };
      }>(
        {
          test: {
            type: 'test',
            message: 'error',
            deep: {
              type: 'deep',
              message: 'error',
            },
          },
        },
        {},
        'test.deep.whatever',
      ),
    ).toEqual({
      error: {
        type: 'deep',
        message: 'error',
      },
      name: 'test.deep',
    });

    expect(
      schemaErrorLookup(
        {
          test: {
            type: 'test',
            message: 'error',
          },
        },
        {},
        'test.0.whatever',
      ),
    ).toEqual({
      error: {
        type: 'test',
        message: 'error',
      },
      name: 'test',
    });

    expect(
      schemaErrorLookup(
        {
          test: {
            type: 'test',
            message: 'error',
          },
        },
        {},
        'test',
      ),
    ).toEqual({
      error: {
        type: 'test',
        message: 'error',
      },
      name: 'test',
    });

    expect(
      schemaErrorLookup<{
        test: {
          deep: string;
        };
        test1: {
          nested: {
            deepNested: string;
          };
        };
      }>(
        {
          test: {
            type: 'test',
            message: 'error',
          },
          test1: {
            type: 'test',
            message: 'error',
            nested: {
              type: 'test',
              message: 'error',
              deepNested: {
                type: 'deepNested',
                message: 'error',
              },
            },
          },
        },
        {},
        'test1.nested.deepNested.whatever',
      ),
    ).toEqual({
      error: { message: 'error', type: 'deepNested' },
      name: 'test1.nested.deepNested',
    });
  });

  it('should return undefined when not found', () => {
    expect(
      schemaErrorLookup(
        {
          test: {
            type: 'test',
            message: 'error',
          },
        },
        {},
        'test1234',
      ),
    ).toEqual({ error: undefined, name: 'test1234' });

    expect(
      schemaErrorLookup(
        {
          test: {
            type: 'test',
            message: 'error',
          },
        },
        {},
        'testX.1.test',
      ),
    ).toEqual({
      name: 'testX.1.test',
    });

    expect(
      schemaErrorLookup<{
        test: {
          test: string;
          test1: string;
        };
      }>(
        {
          test: {
            test: {
              type: 'test',
              message: 'error',
            },
            test1: {
              type: 'test',
              message: 'error',
            },
          },
        },
        {},
        'test.test2',
      ),
    ).toEqual({
      name: 'test.test2',
    });
  });

  it('should prevent error from reported when field is identified', () => {
    expect(
      schemaErrorLookup<{
        test: {
          test: string;
          test1: string;
        };
      }>(
        {
          test: {
            test: {
              type: 'test',
              message: 'error',
            },
            test1: {
              type: 'test',
              message: 'error',
            },
          },
        },
        {
          test: {
            test1: {
              _f: {
                ref: {},
                name: 'test',
              },
            },
          },
        },
        'test.test1.whatever',
      ),
    ).toEqual({
      name: 'test.test1.whatever',
    });

    expect(
      schemaErrorLookup<{
        test: {
          test: string;
          test1: string;
        };
      }>(
        {
          test: {
            test: {
              type: 'test',
              message: 'error',
            },
            test1: {
              type: 'test',
              message: 'error',
            },
          },
        },
        {
          test: {
            test1: {
              _f: {
                ref: {},
                name: 'test',
              },
            },
          },
        },
        'test.testXYZ',
      ),
    ).toEqual({
      name: 'test.testXYZ',
    });
  });

  it('should find the nearest root error', () => {
    const errors = {
      test: {
        0: {
          root: {
            type: 'root',
            message: 'higher-root',
          },
          nested: {
            root: {
              type: 'root',
              message: 'correct-root',
            },
            0: {
              deepNested: {
                type: 'deepNested',
                message: 'error',
              },
            },
          },
        },
      },
    };

    expect(
      schemaErrorLookup<{ test: { nested: { deepNested: string }[] }[] }>(
        errors,
        {},
        'test.0.nested.1',
      ),
    ).toEqual({
      error: { message: 'correct-root', type: 'root' },
      name: 'test.0.nested',
    });

    expect(
      schemaErrorLookup<{ test: { nested: { deepNested: string }[] }[] }>(
        errors,
        {},
        'test.0.nested.0.deepNested',
      ),
    ).toEqual({
      error: { message: 'error', type: 'deepNested' },
      name: 'test.0.nested.0.deepNested',
    });
  });

  it('should return consistent error path for field array validation (issue #13258)', () => {
    const fieldArrayError = {
      type: 'custom',
      message: 'at_least_1_item',
      ref: {},
    };

    expect(
      schemaErrorLookup(
        {
          items: fieldArrayError as any,
        },
        {
          items: [],
        },
        'items',
      ),
    ).toEqual({
      error: fieldArrayError,
      name: 'items',
    });

    expect(
      schemaErrorLookup(
        {
          items: fieldArrayError as any,
        },
        {
          items: [],
        },
        'items.field',
      ),
    ).toEqual({
      error: fieldArrayError,
      name: 'items',
    });

    expect(
      schemaErrorLookup(
        {
          items: fieldArrayError as any,
        },
        {
          items: [],
        },
        'items.0.field',
      ),
    ).toEqual({
      error: fieldArrayError,
      name: 'items',
    });
  });

  it('should handle field array errors consistently with trigger() and handleSubmit()', () => {
    const itemsError = {
      type: 'custom',
      message: 'at_least_1_item',
      ref: {},
    };

    const errors = {
      items: itemsError as any,
    };

    const fields = {
      items: [],
    };

    const result1 = schemaErrorLookup(errors, fields, 'items');
    const result2 = schemaErrorLookup(errors, fields, 'items.0');

    expect(result1.error?.message).toBe('at_least_1_item');
    expect(result2.error?.message).toBe('at_least_1_item');

    expect(result1.error?.root).toBeUndefined();
    expect(result2.error?.root).toBeUndefined();
  });

  it('should not wrap field array errors in root property', () => {
    const itemsValidationError = {
      type: 'validate',
      message: 'Minimum 1 item required',
      ref: {},
    };

    const result = schemaErrorLookup(
      {
        items: itemsValidationError as any,
      },
      {
        items: [],
      },
      'items',
    );

    expect(result.error).toEqual(itemsValidationError);
    expect(result.error?.root).toBeUndefined();
    expect(result.name).toBe('items');
  });
});
