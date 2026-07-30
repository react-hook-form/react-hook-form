import type { FieldValues } from '../types';
import get from '../utils/get';
import isObject from '../utils/isObject';

function isDirtyContainer(value: unknown): boolean {
  return Array.isArray(value) || isObject(value);
}

export default function collectDirtyFieldNames(
  dirtyTree: FieldValues,
  cachedDirtyFields: FieldValues,
  prefix = '',
  names: string[] = [],
) {
  for (const key in dirtyTree) {
    const path = prefix ? `${prefix}.${key}` : key;
    const value = dirtyTree[key];

    if (
      isDirtyContainer(value) &&
      isDirtyContainer(get(cachedDirtyFields, path))
    ) {
      collectDirtyFieldNames(value, cachedDirtyFields, path, names);
    } else {
      names.push(path);
    }
  }

  return names;
}
