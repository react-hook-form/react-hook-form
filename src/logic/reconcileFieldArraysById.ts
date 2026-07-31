import isObject from '../utils/isObject';
import isUndefined from '../utils/isUndefined';

type RowId = string | number;

const getRowId = (row: unknown): RowId | undefined => {
  if (isObject(row)) {
    const id = (row as Record<string, unknown>).id;
    if (typeof id === 'string' || typeof id === 'number') {
      return id;
    }
  }
  return undefined;
};

const getRowIdIndexes = (rows: unknown[]): Map<RowId, number> | undefined => {
  const indexes = new Map<RowId, number>();
  for (let index = 0; index < rows.length; index++) {
    const id = getRowId(rows[index]);
    if (isUndefined(id) || indexes.has(id)) {
      return undefined;
    }
    indexes.set(id, index);
  }
  return indexes;
};

const isContainer = (value: unknown): value is Record<string, any> =>
  Array.isArray(value) || isObject(value);

/**
 * Rebuilds a tree that mirrors the previous form values (the values
 * themselves, dirtyFields, touchedFields or errors) so its array entries
 * follow row identity instead of index when the incoming values reorder,
 * insert or remove rows. Rows are matched by their `id` property; an array
 * whose rows lack unique ids on either side keeps index-based behavior.
 * Entries for rows the incoming values no longer contain are dropped, and
 * non-index array properties (e.g. a field array `root` error) are
 * preserved. Traversal is driven by the two value trees, so state leaves
 * such as error objects are never descended into.
 */
export default function reconcileFieldArraysById<T>(
  tree: T,
  previousValues: unknown,
  nextValues: unknown,
): T {
  if (
    Array.isArray(tree) &&
    Array.isArray(previousValues) &&
    Array.isArray(nextValues)
  ) {
    const previousIndexes = getRowIdIndexes(previousValues);

    if (previousIndexes && getRowIdIndexes(nextValues)) {
      const result: Record<string, any> = nextValues.map((nextRow) => {
        const previousIndex = previousIndexes.get(getRowId(nextRow)!);
        return isUndefined(previousIndex)
          ? undefined
          : reconcileFieldArraysById(
              tree[previousIndex],
              previousValues[previousIndex],
              nextRow,
            );
      });

      for (const key in tree) {
        if (isNaN(+key)) {
          result[key] = tree[key as keyof typeof tree];
        }
      }

      return result as T;
    }
  }

  if (isContainer(tree) && isContainer(previousValues)) {
    const result: Record<string, any> = Array.isArray(tree)
      ? [...tree]
      : { ...tree };

    for (const key in result) {
      result[key] = reconcileFieldArraysById(
        result[key],
        previousValues[key],
        isContainer(nextValues) ? nextValues[key] : undefined,
      );
    }

    return result as T;
  }

  return tree;
}
