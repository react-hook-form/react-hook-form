import getFieldArrayParentNames from '../../logic/getFieldArrayParentNames';

describe('getFieldArrayParentNames', () => {
  it('should find match array field', () => {
    expect(getFieldArrayParentNames(new Set(['test']), 'test.0')).toEqual([
      'test',
    ]);
    expect(getFieldArrayParentNames(new Set(['te']), 'test.0')).toEqual([]);
    expect(getFieldArrayParentNames(new Set(['te']), 'test.0')).toEqual([]);
    expect(getFieldArrayParentNames(new Set(['test1']), 'test[0]')).toEqual([]);
    expect(getFieldArrayParentNames(new Set(['test1']), 'test.0')).toEqual([]);
    expect(
      getFieldArrayParentNames(new Set(['test']), 'test.0.data[0]'),
    ).toEqual(['test']);
    expect(
      getFieldArrayParentNames(new Set(['test']), 'test.0.data.0'),
    ).toEqual(['test']);
    expect(
      getFieldArrayParentNames(new Set(['test']), 'test1.0.data.0'),
    ).toEqual([]);
    expect(
      getFieldArrayParentNames(new Set(['test']), 'data.0.data.0'),
    ).toEqual([]);
  });

  it('should find match when field array is nested under a numeric path segment', () => {
    // Field array registered at `steps.0.items`, Controller name is `steps.0.items.2.name`
    // getNodeParentName returns `steps` (first numeric segment), but the field array
    // is `steps.0.items` — so getFieldArrayParentNames must check deeper parents too.
    expect(
      getFieldArrayParentNames(
        new Set(['steps.0.items']),
        'steps.0.items.2.name',
      ),
    ).toEqual(['steps.0.items']);
    expect(
      getFieldArrayParentNames(
        new Set(['steps.0.items']),
        'steps.0.items.0.value',
      ),
    ).toEqual(['steps.0.items']);
    // Deeper nesting: `a.0.b.1.items`
    expect(
      getFieldArrayParentNames(
        new Set(['a.0.b.1.items']),
        'a.0.b.1.items.3.name',
      ),
    ).toEqual(['a.0.b.1.items']);
    // Should still return empty when there's no actual match
    expect(
      getFieldArrayParentNames(
        new Set(['steps.0.other']),
        'steps.0.items.2.name',
      ),
    ).toEqual([]);
    // Original top-level behavior should still work
    expect(
      getFieldArrayParentNames(new Set(['items']), 'items.2.name'),
    ).toEqual(['items']);
  });
});
