import setFieldArrayDirtyFields from '../../logic/setFieldArrayDirtyFields';

describe('setFieldArrayDirtyFields', () => {
  it('should set correctly dirty', () => {
    expect(
      setFieldArrayDirtyFields(
        [{ data: 'bill' }, { data: 'luo', data1: 'luo1' }],
        [{ data: 'bill1' }, { data: 'luo2' }],
        [],
      ),
    ).toEqual([
      {
        data: true,
      },
      {
        data: true,
        data1: true,
      },
    ]);
  });

  it('should not set dirtyFields fields for nested input data which are deep equal', () => {
    expect(
      setFieldArrayDirtyFields(
        [{ data: 'luo', data1: 'luo1' }],
        [{ data: 'luo', data1: 'luo1' }],
        [],
      ),
    ).toEqual([]);
  });

  it('should unset dirtyFields fields when value matches', () => {
    expect(
      setFieldArrayDirtyFields(
        [{ data: 'bill' }, { data: 'luo2', data1: 'luo1' }],
        [{ data: 'bill1' }, { data: 'luo2' }],
        [],
      ),
    ).toEqual([
      {
        data: true,
      },
      {
        data1: true,
      },
    ]);
  });

  it('should works in reverse dirtyFields fields check', () => {
    expect(
      setFieldArrayDirtyFields(
        [{ data: 'bill1' }, { data: 'luo2' }],
        [{ data: 'bill' }, { data: 'luo', data1: 'luo1' }],
        [],
      ),
    ).toEqual([
      {
        data: true,
      },
      {
        data: true,
        data1: true,
      },
    ]);

    expect(
      setFieldArrayDirtyFields(
        [{ data: 'bill1' }, { data: 'luo2' }],
        [{ data: 'bill' }, { data: 'luo2', data1: 'luo1' }],
        [],
      ),
    ).toEqual([
      {
        data: true,
      },
      {
        data1: true,
      },
    ]);
  });

  it('should work for empty values compare with defaultValues', () => {
    expect(
      setFieldArrayDirtyFields(
        [],
        [{ data: 'bill' }, { data: 'luo2', data1: 'luo1' }],
        [],
      ),
    ).toEqual([
      {
        data: true,
      },
      {
        data: true,
        data1: true,
      },
    ]);
  });

  it('should set correctly with nested dirty', () => {
    expect(
      setFieldArrayDirtyFields(
        [
          { data: 'bill' },
          {
            data: 'luo',
            data1: 'luo1',
            nested: [{ data: 'luo', data1: 'luo1' }],
            nested1: [{ data: 'luo', data1: 'luo1' }],
          },
        ],
        [{ data: 'bill1' }, { data: 'luo2' }],
        [],
      ),
    ).toEqual([
      {
        data: true,
      },
      {
        data: true,
        data1: true,
        nested: [{ data: true, data1: true }],
        nested1: [{ data: true, data1: true }],
      },
    ]);
  });

  it('should unset nested dirtyFields fields when value matches', () => {
    expect(
      setFieldArrayDirtyFields(
        [
          { data: 'bill' },
          {
            data: 'luo',
            data1: 'luo1',
            nested: [{ data: 'luo', data1: 'luo1' }],
            nested1: [{ data: 'luo', data1: 'luo1' }],
          },
        ],
        [
          { data: 'bill1' },
          {
            data: 'luo2',
            data1: 'luo1',
            nested: [{ data: 'luo', data1: 'luo1' }],
          },
        ],
        [],
      ),
    ).toEqual([
      {
        data: true,
      },
      {
        data: true,
        nested1: [{ data: true, data1: true }],
      },
    ]);
  });

  it('should reset dirtyFields fields', () => {
    expect(
      setFieldArrayDirtyFields(
        [{ data: 'bill' }],
        [{ data: 'bill' }],
        [
          {
            data: true,
          },
        ],
      ),
    ).toEqual([
      {
        data: undefined,
      },
    ]);
  });

  it('should reset dirtyFields fields', () => {
    expect(
      setFieldArrayDirtyFields(
        [
          {
            test1: 'test',
            test: [
              {
                test: 'test1',
              },
            ],
          },
        ],

        [
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

        [],
      ),
    ).toMatchInlineSnapshot(`
      Array [
        Object {
          "test": true,
          "test1": true,
        },
        Object {
          "test": Array [
            Object {
              "test": true,
            },
          ],
          "test1": true,
        },
      ]
    `);
  });
});
