import isObject from '../utils/isObject';
import isPlainObject from '../utils/isPlainObject';
import isUndefined from '../utils/isUndefined';

export type GetRowId = (
  row: unknown,
  arrayPath: string,
) => string | number | undefined;

const defaultGetRowId: GetRowId = (row) => {
  if (isObject(row)) {
    const id = (row as Record<string, unknown>).id;
    if (typeof id === 'string' || typeof id === 'number') {
      return id;
    }
  }
  return undefined;
};

const getRowIdIndexes = (
  rows: unknown[],
  getRowId: GetRowId,
  arrayPath: string,
): Map<string, number> | undefined => {
  const indexes = new Map<string, number>();
  for (let index = 0; index < rows.length; index++) {
    const id = getRowId(rows[index], arrayPath);
    if (typeof id !== 'string' && typeof id !== 'number') {
      return undefined;
    }
    const key = `${id}`;
    if (indexes.has(key)) {
      return undefined;
    }
    indexes.set(key, index);
  }
  return indexes;
};

const hasDirtyRowId = (dirtyRows: unknown): boolean =>
  Array.isArray(dirtyRows) &&
  dirtyRows.some(
    (dirtyRow) =>
      dirtyRow === true || (isObject(dirtyRow) && !!(dirtyRow as any).id),
  );

const isContainer = (value: unknown): value is Record<string, any> =>
  Array.isArray(value) || isObject(value);

const isCopyableContainer = (value: unknown): value is Record<string, any> =>
  Array.isArray(value) || (isObject(value) && isPlainObject(value));

const copyNonIndexKeys = (
  source: Record<string, any>,
  target: Record<string, any>,
) => {
  for (const key in source) {
    if (isNaN(+key)) {
      target[key] = source[key];
    }
  }
};

/**
 * Rebuilds a tree that mirrors the previous form values (the values
 * themselves, dirtyFields, touchedFields or errors) so its array entries
 * follow row identity instead of index when the incoming values reorder,
 * insert or remove rows. Rows are matched by `getRowId` — their `id`
 * property by default — and an array whose rows lack unique ids on either
 * side keeps index-based behavior, as does an array whose own `id` field is
 * dirty under the default matcher (an edited id no longer identifies its
 * row). Entries for rows the incoming values no longer contain are dropped,
 * and non-index array properties (e.g. a field array `root` error) are
 * preserved. Traversal is driven by the two value trees, so state leaves
 * such as error objects are never descended into, and only arrays and plain
 * objects are copied — class instances like File pass through by reference.
 */
export default function reconcileFieldArraysById<T>(
  tree: T,
  previousValues: unknown,
  nextValues: unknown,
  getRowId?: GetRowId,
  previousDirtyFields?: unknown,
  path = '',
): T {
  const matchRow = getRowId || defaultGetRowId;

  if (
    Array.isArray(tree) &&
    Array.isArray(previousValues) &&
    Array.isArray(nextValues) &&
    !(!getRowId && hasDirtyRowId(previousDirtyFields))
  ) {
    const previousIndexes = getRowIdIndexes(previousValues, matchRow, path);

    if (previousIndexes && getRowIdIndexes(nextValues, matchRow, path)) {
      const result: Record<string, any> = nextValues.map(
        (nextRow, nextIndex) => {
          const previousIndex = previousIndexes.get(
            `${matchRow(nextRow, path)}`,
          );
          return isUndefined(previousIndex)
            ? undefined
            : reconcileFieldArraysById(
                tree[previousIndex],
                previousValues[previousIndex],
                nextRow,
                getRowId,
                isContainer(previousDirtyFields)
                  ? previousDirtyFields[previousIndex]
                  : undefined,
                `${path}.${nextIndex}`,
              );
        },
      );

      copyNonIndexKeys(tree, result);

      return result as T;
    }
  }

  if (isCopyableContainer(tree) && isContainer(previousValues)) {
    const result: Record<string, any> = Array.isArray(tree)
      ? [...tree]
      : { ...tree };

    if (Array.isArray(tree)) {
      copyNonIndexKeys(tree, result);
    }

    for (const key in result) {
      result[key] = reconcileFieldArraysById(
        result[key],
        previousValues[key],
        isContainer(nextValues) ? nextValues[key] : undefined,
        getRowId,
        isContainer(previousDirtyFields) ? previousDirtyFields[key] : undefined,
        path ? `${path}.${key}` : key,
      );
    }

    return result as T;
  }

  return tree;
}
