import unset from '../../utils/unset';

describe('unset deletion notifications', () => {
  it('notifies after deleting an own undefined value', () => {
    const values = { row: { value: undefined, other: 'kept' } };
    const notify = jest.fn();
    expect(unset(values, 'row.value', notify)).toBe(values);
    expect(Object.prototype.hasOwnProperty.call(values.row, 'value')).toBe(
      false,
    );
    expect(values.row.other).toBe('kept');
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('does not notify for a missing leaf in a nonempty parent', () => {
    const values = { row: { other: 'kept' } };
    const notify = jest.fn();
    unset(values, 'row.absent', notify);
    expect(values).toEqual({ row: { other: 'kept' } });
    expect(notify).not.toHaveBeenCalled();
  });

  it('notifies for actual ancestor removals even when the requested leaf is missing', () => {
    const values = { root: { empty: {} } };
    const notify = jest.fn();
    unset(values, 'root.empty.absent', notify);
    expect(values).toEqual({});
    expect(notify).toHaveBeenCalledTimes(2);
  });

  it('notifies when an empty array ancestor is pruned', () => {
    const values = { list: [] };
    const notify = jest.fn();
    unset(values, 'list.3', notify);
    expect(values).toEqual({});
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('retains existing sparse-array deletion behavior', () => {
    const values = ['a', 'b'];
    const notify = jest.fn();
    unset(values, '0', notify);
    expect(values).toHaveLength(2);
    expect(0 in values).toBe(false);
    expect(values[1]).toBe('b');
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('uses an exact literal key before interpreting a dotted path', () => {
    const values = { 'a.b': 1, a: { b: 2 } };
    const notify = jest.fn();
    unset(values, 'a.b', notify);
    expect(values).toEqual({ a: { b: 2 } });
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('does not notify for an inherited property that was not removed', () => {
    const values = Object.create({ inherited: 1 }) as { inherited: number };
    const notify = jest.fn();
    unset(values, 'inherited', notify);
    expect(values.inherited).toBe(1);
    expect(notify).not.toHaveBeenCalled();
  });

  it('keeps the normal two-argument return and pruning behavior', () => {
    const values = { root: { leaf: 1 } };
    expect(unset(values, 'root.leaf')).toBe(values);
    expect(values).toEqual({});
  });
});
