import getDirtyFields from '../../logic/getDirtyFields';

describe('getDirtyFields', () => {
  it('preserve the top-level array shape', () => {
    expect(getDirtyFields(['default'], ['updated'])).toEqual([true]);
  });

  it('return all the dirty fields', () => {
    expect(
      getDirtyFields(
        {},
        {
          test: {
            test1: 'bill',
            test2: 'luo',
          },
          test1: ['1', '2', '3'],
          test2: [
            {
              test1: 'bill',
              test2: 'luo',
            },
          ],
        },
      ),
    ).toEqual({
      test: {
        test1: true,
        test2: true,
      },
      test1: [true, true, true],
      test2: [
        {
          test1: true,
          test2: true,
        },
      ],
    });

    expect(
      getDirtyFields(
        {
          test: {
            test1: '',
            test2: 'luo',
          },
          test1: ['1'],
          test2: [
            {
              test1: 'bill',
              test2: '',
            },
          ],
        },
        {
          test: {
            test1: 'bill',
            test2: 'luo',
          },
          test1: ['1', '2', '3'],
          test2: [
            {
              test1: 'bill',
              test2: 'luo',
            },
          ],
        },
      ),
    ).toEqual({
      test: {
        test1: true,
      },
      test1: [undefined, true, true],
      test2: [
        {
          test2: true,
        },
      ],
    });
  });

  it('set correctly dirty', () => {
    expect(
      getDirtyFields(
        {
          test: [{ data: 'bill' }, { data: 'luo', data1: 'luo1' }],
        },
        {
          test: [{ data: 'bill1' }, { data: 'luo2' }],
        },
      ),
    ).toEqual({
      test: [
        {
          data: true,
        },
        {
          data: true,
          data1: true,
        },
      ],
    });
  });

  it('not set dirtyFields fields for nested input data which are deep equal', () => {
    expect(
      getDirtyFields(
        { test: [{ data: 'luo', data1: 'luo1' }] },
        { test: [{ data: 'luo', data1: 'luo1' }] },
      ),
    ).toEqual({});
  });

  it('unset dirtyFields fields when value matches', () => {
    expect(
      getDirtyFields(
        { test: [{ data: 'bill' }, { data: 'luo2', data1: 'luo1' }] },
        { test: [{ data: 'bill1' }, { data: 'luo2' }] },
      ),
    ).toEqual({ test: [{ data: true }, { data1: true }] });
  });

  it('works in reverse dirtyFields fields check', () => {
    expect(
      getDirtyFields(
        { test: [{ data: 'bill1' }, { data: 'luo2' }] },
        { test: [{ data: 'bill' }, { data: 'luo', data1: 'luo1' }] },
      ),
    ).toEqual({ test: [{ data: true }, { data: true, data1: true }] });

    expect(
      getDirtyFields(
        { test: [{ data: 'bill1' }, { data: 'luo2' }] },
        { test: [{ data: 'bill' }, { data: 'luo2', data1: 'luo1' }] },
      ),
    ).toEqual({ test: [{ data: true }, { data1: true }] });
  });

  it('work for empty values compare with defaultValues', () => {
    expect(
      getDirtyFields(
        { test: [] },
        { test: [{ data: 'bill' }, { data: 'luo2', data1: 'luo1' }] },
      ),
    ).toEqual({
      test: [
        {
          data: true,
        },
        {
          data: true,
          data1: true,
        },
      ],
    });
  });

  it('set correctly with nested dirty', () => {
    expect(
      getDirtyFields(
        {
          test: [
            { data: 'bill' },
            {
              data: 'luo',
              data1: 'luo1',
              nested: [{ data: 'luo', data1: 'luo1' }],
              nested1: [{ data: 'luo', data1: 'luo1' }],
            },
          ],
        },
        { test: [{ data: 'bill1' }, { data: 'luo2' }] },
      ),
    ).toEqual({
      test: [
        {
          data: true,
        },
        {
          data: true,
          data1: true,
          nested: [{ data: true, data1: true }],
          nested1: [{ data: true, data1: true }],
        },
      ],
    });
  });

  it('keep nested dirtyFields fields when value matches', () => {
    expect(
      getDirtyFields(
        {
          test: [
            { data: 'bill' },
            {
              data: 'luo',
              data1: 'luo1',
              nested: [{ data: 'luo', data1: 'luo1' }],
              nested1: [{ data: 'luo', data1: 'luo1' }],
            },
          ],
        },
        {
          test: [
            { data: 'bill1' },
            {
              data: 'luo2',
              data1: 'luo1',
              nested: [{ data: 'luo', data1: 'luo1' }],
            },
          ],
        },
      ),
    ).toEqual({
      test: [
        {
          data: true,
        },
        {
          data: true,
          nested1: [{ data: true, data1: true }],
        },
      ],
    });
  });

  it('reset dirtyFields fields', () => {
    expect(
      getDirtyFields(
        { test: [{ data: 'bill' }] },
        { test: [{ data: 'bill' }] },
      ),
    ).toEqual({});
  });

  it('reset dirtyFields fields', () => {
    expect(
      getDirtyFields(
        {
          test: [
            {
              test1: 'test',
              test: [
                {
                  test: 'test1',
                },
              ],
            },
          ],
        },
        {
          test: [
            {
              test1: 'test1',
              test: null,
            },

            {
              test1: 'test',
              test: [
                {
                  test: 'test1',
                },
              ],
            },
          ],
        },
      ),
    ).toEqual({
      test: [
        {
          test: [
            {
              test: true,
            },
          ],
          test1: true,
        },
        {
          test: [
            {
              test: true,
            },
          ],
          test1: true,
        },
      ],
    });
  });

  it('work out with different data type', () => {
    expect(
      getDirtyFields(
        {
          test: [
            {
              test1: 'test',
              test: [
                {
                  test: 'test1',
                },
              ],
            },
          ],
        },
        {
          test: [
            {
              test1: 'test1',
              test: true,
            },
            {
              test1: 'test',
              test: [
                {
                  test: 'test1',
                },
              ],
            },
          ],
        },
      ),
    ).toEqual({
      test: [
        {
          test: [
            {
              test: true,
            },
          ],
          test1: true,
        },
        {
          test: [
            {
              test: true,
            },
          ],
          test1: true,
        },
      ],
    });
  });

  it('include fields with null values', () => {
    expect(
      getDirtyFields(
        {},
        {
          views: null,
          name: 'test',
          count: 0,
        },
      ),
    ).toEqual({
      views: true,
      name: true,
      count: true,
    });
  });

  it('prune empty array', () => {
    expect(
      getDirtyFields(
        { test: { data: [{ value: 'default' }] } },
        { test: { data: [{ value: 'default' }] } },
      ),
    ).toEqual({});
  });

  it('not leave a stray empty array for a field array with no default value once all items are removed (#13600)', () => {
    expect(getDirtyFields({}, { data: [] })).toEqual({});
  });

  it('not leave a stray empty array for a nested field array with no default value once all items are removed (#13600)', () => {
    expect(
      getDirtyFields(
        { test: [{ firstName: 'bill' }, { firstName: 'bill' }] },
        {
          test: [{ firstName: 'luo' }, { firstName: 'luo', keyValue: [] }],
        },
      ),
    ).toEqual({
      test: [{ firstName: true }, { firstName: true }],
    });
  });

  it('mark null values as dirty when comparing with defaultValues', () => {
    expect(
      getDirtyFields(
        {
          views: null,
          name: 'test',
        },
        {
          views: null,
          name: 'other',
        },
      ),
    ).toEqual({
      name: true,
    });
  });

  it.each([null, undefined])(
    'mark every default leaf as dirty when form values are %s',
    (formValues) => {
      expect(
        getDirtyFields<Record<string, unknown> | null | undefined>(
          { type: 'static', value: 100, nested: { name: 'bill' } },
          formValues,
        ),
      ).toEqual({ type: true, value: true, nested: { name: true } });

      expect(
        getDirtyFields<string[] | null | undefined>(['a', 'b'], formValues),
      ).toEqual([true, true]);
    },
  );

  it('mark an array-valued registered field as dirty with a boolean rather than diffing elements (#13584)', () => {
    const fieldRefs = {
      fruits: { _f: { name: 'fruits', ref: {} } },
    };

    expect(
      getDirtyFields(
        { fruits: ['apple'] },
        { fruits: ['apple', 'banana'] },
        undefined,
        fieldRefs,
      ),
    ).toEqual({
      fruits: true,
    });

    expect(
      getDirtyFields(
        { fruits: ['apple'] },
        { fruits: ['apple'] },
        undefined,
        fieldRefs,
      ),
    ).toEqual({});
  });

  it('still diff a field array element-by-element when the array path itself is not a registered leaf', () => {
    const fieldRefs = {
      test: [{ value: { _f: { name: 'test.0.value', ref: {} } } }],
    };

    expect(
      getDirtyFields(
        { test: [{ value: 'a' }, { value: 'b' }] },
        { test: [{ value: 'a' }, { value: 'changed' }] },
        undefined,
        fieldRefs,
      ),
    ).toEqual({
      test: [undefined, { value: true }],
    });
  });

  it('diff nested arrays element-by-element', () => {
    expect(
      getDirtyFields(
        {
          matrix: [
            [1, 2],
            [3, 4],
          ],
        },
        {
          matrix: [
            [1, 9],
            [3, 4],
          ],
        },
      ),
    ).toStrictEqual({ matrix: [[undefined, true], undefined] });
  });

  it('diff arrays nested inside array items', () => {
    expect(
      getDirtyFields(
        {
          steps: [
            { tags: ['a', 'b'], meta: { values: [{ id: 1 }] } },
            { tags: ['c'], meta: { values: [{ id: 2 }] } },
          ],
        },
        {
          steps: [
            { tags: ['a', 'b'], meta: { values: [{ id: 1 }, { id: 3 }] } },
            { tags: ['d'], meta: { values: [{ id: 2 }] } },
          ],
        },
      ),
    ).toStrictEqual({
      steps: [
        { meta: { values: [undefined, { id: true }] } },
        { tags: [true] },
      ],
    });
  });

  it('mark items appended to a nested array as dirty', () => {
    expect(
      getDirtyFields(
        { test: { list: [[{ value: 'a' }]] } },
        {
          test: { list: [[{ value: 'a' }, { value: 'b' }], [{ value: 'c' }]] },
        },
      ),
    ).toStrictEqual({
      test: { list: [[undefined, { value: true }], [{ value: true }]] },
    });
  });

  it('mark items removed from a nested array as dirty', () => {
    expect(
      getDirtyFields(
        { test: [{ list: ['a', 'b', 'c'] }] },
        { test: [{ list: ['a'] }] },
      ),
    ).toStrictEqual({ test: [{ list: [undefined, true, true] }] });
  });

  it('keep holes in sparse form value arrays', () => {
    const values: { name: string }[] = [];
    values[2] = { name: 'bill' };
    const expected: { name: boolean }[] = [];
    expected[2] = { name: true };

    expect(getDirtyFields({ test: [] }, { test: values })).toStrictEqual({
      test: expected,
    });
  });

  it('skip holes in sparse default value arrays', () => {
    const defaultValues: { name: string }[] = [];
    defaultValues[1] = { name: 'bill' };

    expect(
      getDirtyFields(
        { test: defaultValues },
        { test: [{ name: 'luo' }, { name: 'bill' }] },
      ),
    ).toStrictEqual({ test: [{ name: true }, undefined] });
  });

  it('keep sparse nested arrays aligned by index', () => {
    const inner: string[] = [];
    inner[3] = 'd';
    const expected: boolean[] = [];
    expected[3] = true;

    expect(
      getDirtyFields({ test: [{ list: [] }] }, { test: [{ list: inner }] }),
    ).toStrictEqual({ test: [{ list: expected }] });
  });

  it('merge into existing dirty fields for nested arrays', () => {
    expect(
      getDirtyFields(
        { test: [{ list: ['a', 'b'] }] },
        { test: [{ list: ['a', 'c'] }] },
        { test: [{ list: [true] }] },
      ),
    ).toStrictEqual({ test: [{ list: [undefined, true] }] });
  });
});
