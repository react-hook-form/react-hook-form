import collectDirtyFieldNames from '../../logic/collectDirtyFieldNames';
import getDirtyFields from '../../logic/getDirtyFields';

describe('collectDirtyFieldNames', () => {
  it('should return an empty array for an empty dirty tree', () => {
    expect(collectDirtyFieldNames({}, {})).toEqual([]);
  });

  it('should collect top-level and nested leaf paths', () => {
    const dirtyTree = { a: true, b: { c: true, d: { e: true } } };

    expect(collectDirtyFieldNames(dirtyTree, dirtyTree)).toEqual([
      'a',
      'b.c',
      'b.d.e',
    ]);
  });

  it('should skip undefined holes left in arrays by getDirtyFields', () => {
    const dirtyTree = { items: [undefined, { name: true }] };

    expect(collectDirtyFieldNames(dirtyTree, dirtyTree)).toEqual([
      'items.1.name',
    ]);
  });

  it('should skip clean array items produced by getDirtyFields', () => {
    const dirtyTree = getDirtyFields(
      { items: [{ name: 'a' }, { name: 'b' }] },
      { items: [{ name: 'a' }, { name: 'changed' }] },
    );

    expect(collectDirtyFieldNames(dirtyTree, dirtyTree)).toEqual([
      'items.1.name',
    ]);
  });

  it('should not descend into empty containers', () => {
    expect(collectDirtyFieldNames({ a: {}, b: [] }, { a: {}, b: [] })).toEqual(
      [],
    );
  });

  it('should stop at the container path when the cached dirty fields mark it as a leaf', () => {
    expect(
      collectDirtyFieldNames(
        { items: [{ name: true }], nested: { a: true } },
        { items: true, nested: true },
      ),
    ).toEqual(['items', 'nested']);
  });

  it('should stop at the container path when the cached dirty fields have no entry', () => {
    expect(collectDirtyFieldNames({ nested: { a: true } }, {})).toEqual([
      'nested',
    ]);
  });

  it('should prepend the given prefix', () => {
    expect(
      collectDirtyFieldNames({ a: true }, { root: { a: true } }, 'root'),
    ).toEqual(['root.a']);
  });
});
