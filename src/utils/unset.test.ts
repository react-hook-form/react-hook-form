import unset from './unset';

describe('unset', () => {
  it('should unset the array', () => {
    const test = ['test', 'test1', 'test2'];
    expect(unset(test, '[0]')).toEqual([undefined, 'test1', 'test2']);
    expect(unset(test, '[1]')).toEqual([undefined, undefined, 'test2']);
    expect(unset(test, '[2]')).toEqual([undefined, undefined, undefined]);
  });

  it('should unset the flat object', () => {
    const test = {
      test: 'test',
    };

    expect(unset(test, 'test')).toEqual({});
  });

  it('should not unset if specified field is undefined', () => {
    const test = {
      test: {
        test1: 'test',
      },
    };

    expect(unset(test, 'testDummy.test1')).toEqual({ test: { test1: 'test' } });
  });

  it('should unset the nest object', () => {
    const test = {
      test: {
        min: 'test',
      },
    };

    expect(unset(test, 'test.min')).toEqual({});
  });

  it('should unset deep object', () => {
    const test = {
      test: {
        bill: {
          min: 'test',
        },
      },
    };

    expect(unset(test, 'test.bill.min')).toEqual({});
  });

  it('should unset the including multiple field object', () => {
    const deep = {
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

    const test = {
      test: {
        bill: {
          min: [{ deep }],
        },
        test: 'ha',
      },
    };

    expect(unset(test, 'test.bill.min[0].deep')).toEqual({
      test: {
        test: 'ha',
      },
    });
  });

  it('should unset the object in array', () => {
    const test = {
      test: [{ min: 'required' }],
    };
    expect(unset(test, 'test[0].min')).toEqual({});
  });

  it('should return empty object when inner object is empty object', () => {
    const test = {
      data: {
        firstName: {},
      },
    };

    expect(unset(test, 'data.firstName')).toEqual({});
  });

  it('should clear empty array', () => {
    const test = {
      data: {
        firstName: {
          test: [
            { name: undefined, email: undefined },
            { name: 'test', email: 'last' },
          ],
          deep: {
            last: [
              { name: undefined, email: undefined },
              { name: 'test', email: 'last' },
            ],
          },
        },
      },
    };

    expect(unset(test, 'data.firstName.test[0]')).toEqual({
      data: {
        firstName: {
          test: [undefined, { name: 'test', email: 'last' }],
          deep: {
            last: [
              { name: undefined, email: undefined },
              { name: 'test', email: 'last' },
            ],
          },
        },
      },
    });

    const test2 = {
      arrayItem: [
        {
          test1: undefined,
          test2: undefined,
        },
      ],
      data: 'test',
    };

    expect(unset(test2, 'arrayItem[0].test1')).toEqual({
      arrayItem: [
        {
          test2: undefined,
        },
      ],
      data: 'test',
    });
  });

  it('should only remove relevant data', () => {
    const data = {
      test: {},
      testing: {
        key1: 1,
        key2: [
          {
            key4: 4,
            key5: [],
            key6: null,
            key7: '',
            key8: undefined,
            key9: {},
          },
        ],
        key3: [],
      },
    };

    expect(unset(data, 'test')).toEqual({
      testing: {
        key1: 1,
        key2: [
          {
            key4: 4,
            key5: [],
            key6: null,
            key7: '',
            key8: undefined,
            key9: {},
          },
        ],
        key3: [],
      },
    });
  });

  it('should remove empty array item', () => {
    const data = {
      name: [
        {
          message: 'test',
        },
      ],
    };

    expect(unset(data, 'name[0]')).toEqual({});
  });
});
