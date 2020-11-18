import setFieldArrayDirtyFields from './setFieldArrayDirtyFields';

describe('setFieldArrayDirtyFields', () => {
  it('should set correctly dirtyFields', () => {
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

  it('should unset dirty fields when value matches', () => {
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

  it('should works in reverse dirty fields check', () => {
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

  it('should set correctly with nested dirtyFields', () => {
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

  it('should unset nested dirty fields when value matches', () => {
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

  it('should reset dirty fields', () => {
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
});
