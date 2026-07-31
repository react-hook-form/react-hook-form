import reconcileFieldArraysById from '../../logic/reconcileFieldArraysById';

describe('reconcileFieldArraysById', () => {
  it('should reorder array entries to follow row ids in the next values', () => {
    const previousValues = {
      rows: [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Bravo' },
        { id: 'c', name: 'Charlie' },
      ],
    };
    const nextValues = {
      rows: [
        { id: 'c', name: 'Charlie' },
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Bravo' },
      ],
    };

    expect(
      reconcileFieldArraysById(previousValues, previousValues, nextValues),
    ).toEqual({
      rows: [
        { id: 'c', name: 'Charlie' },
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Bravo' },
      ],
    });

    expect(
      reconcileFieldArraysById(
        { rows: [{ name: true }, undefined, { name: true }] },
        previousValues,
        nextValues,
      ),
    ).toEqual({
      rows: [{ name: true }, { name: true }, undefined],
    });
  });

  it('should drop entries for removed rows and leave inserted rows empty', () => {
    const previousValues = {
      rows: [
        { id: 1, name: 'Alpha' },
        { id: 2, name: 'Bravo' },
      ],
    };
    const nextValues = {
      rows: [
        { id: 3, name: 'New' },
        { id: 2, name: 'Bravo' },
      ],
    };

    expect(
      reconcileFieldArraysById(
        { rows: [{ name: true }, { name: true }] },
        previousValues,
        nextValues,
      ),
    ).toEqual({
      rows: [undefined, { name: true }],
    });
  });

  it('should reconcile nested arrays inside matched rows', () => {
    const previousValues = {
      rows: [
        {
          id: 'a',
          items: [
            { id: 'a1', label: 'first' },
            { id: 'a2', label: 'second' },
          ],
        },
        { id: 'b', items: [{ id: 'b1', label: 'third' }] },
      ],
    };
    const nextValues = {
      rows: [
        { id: 'b', items: [{ id: 'b1', label: 'third' }] },
        {
          id: 'a',
          items: [
            { id: 'a2', label: 'second' },
            { id: 'a1', label: 'first' },
          ],
        },
      ],
    };

    expect(
      reconcileFieldArraysById(
        { rows: [{ items: [{ label: true }] }, undefined] },
        previousValues,
        nextValues,
      ),
    ).toEqual({
      rows: [undefined, { items: [undefined, { label: true }] }],
    });
  });

  it('should reconcile nested arrays when parent rows have no ids', () => {
    const previousValues = {
      groups: [
        {
          items: [
            { id: 'x', label: 'one' },
            { id: 'y', label: 'two' },
          ],
        },
      ],
    };
    const nextValues = {
      groups: [
        {
          items: [
            { id: 'y', label: 'two' },
            { id: 'x', label: 'one' },
          ],
        },
      ],
    };

    expect(
      reconcileFieldArraysById(
        { groups: [{ items: [{ label: true }] }] },
        previousValues,
        nextValues,
      ),
    ).toEqual({
      groups: [{ items: [undefined, { label: true }] }],
    });
  });

  it('should keep index-based behavior when rows have missing or duplicated ids', () => {
    const missingIds = {
      rows: [{ name: 'Alpha' }, { name: 'Bravo' }],
    };
    const tree = { rows: [{ name: true }, undefined] };

    expect(
      reconcileFieldArraysById(tree, missingIds, {
        rows: [{ name: 'Bravo' }, { name: 'Alpha' }],
      }),
    ).toEqual(tree);

    const duplicatedIds = {
      rows: [
        { id: 'a', name: 'Alpha' },
        { id: 'a', name: 'Bravo' },
      ],
    };

    expect(
      reconcileFieldArraysById(tree, duplicatedIds, {
        rows: [
          { id: 'a', name: 'Bravo' },
          { id: 'a', name: 'Alpha' },
        ],
      }),
    ).toEqual(tree);
  });

  it('should preserve non-index array properties such as root errors', () => {
    const previousValues = {
      rows: [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: '' },
      ],
    };
    const nextValues = {
      rows: [
        { id: 'b', name: '' },
        { id: 'a', name: 'Alpha' },
      ],
    };
    const rowsErrors: Record<string, any>[] = [];
    rowsErrors[1] = { name: { type: 'required', message: 'required' } };
    (rowsErrors as Record<string, any>).root = {
      type: 'min',
      message: 'too short',
    };

    const result: Record<string, any> = reconcileFieldArraysById(
      { rows: rowsErrors },
      previousValues,
      nextValues,
    );

    expect(result.rows[0]).toEqual({
      name: { type: 'required', message: 'required' },
    });
    expect(result.rows[1]).toBeUndefined();
    expect(result.rows.root).toEqual({ type: 'min', message: 'too short' });
  });

  it('should not descend into state leaves that have no matching value container', () => {
    const ref = { focus: () => {} };
    const previousValues = { user: { name: '' } };
    const nextValues = { user: { name: 'bill' } };
    const errors = {
      user: { name: { type: 'required', message: 'required', ref } },
    };

    const result = reconcileFieldArraysById(errors, previousValues, nextValues);

    expect(result.user.name.ref).toBe(ref);
  });
});
