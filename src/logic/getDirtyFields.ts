import deepEqual from '../utils/deepEqual';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';
import isUndefined from '../utils/isUndefined';
import objectHasFunction from '../utils/objectHasFunction';

function isTraversable<T>(value: T): boolean {
  return Array.isArray(value) || (isObject(value) && !objectHasFunction(value));
}

function markFieldsDirty<T>(
  data: T,
  fields: Record<string, any> = {},
  visited: WeakSet<object> = new WeakSet(),
) {
  if (typeof data === 'object' && data !== null) {
    if (visited.has(data)) {
      return fields; // Already visited, prevent infinite recursion
    }
    visited.add(data); // Track visited object
  }

  for (const key in data) {
    const value = data[key];

    if (isTraversable(value)) {
      fields[key] = Array.isArray(value) ? [] : {};
      markFieldsDirty(value, fields[key], visited);
    } else if (!isUndefined(value)) {
      fields[key] = true;
    }
  }

  return fields;
}

function pruneDirtyFields<T>(value: T): T {
  if (value === false) {
    return undefined as T;
  }

  if (value === true) {
    return true as T;
  }

  if (Array.isArray(value)) {
    const result = value.map((value) => pruneDirtyFields(value));
    return (
      result.some((value) => value !== undefined) ? result : undefined
    ) as T;
  }

  if (isObject(value)) {
    const result: Record<string, unknown> = {};

    for (const key in value) {
      const pruned = pruneDirtyFields(value[key]);

      if (!isUndefined(pruned)) {
        result[key] = pruned;
      }
    }

    return (Object.keys(result).length ? result : undefined) as T;
  }

  return undefined as T;
}

export default function getDirtyFields<T>(
  data: T,
  formValues: T,
  dirtyFieldsFromValues?: Record<
    Extract<keyof T, string>,
    ReturnType<typeof markFieldsDirty> | boolean
  >,
  visited: WeakSet<object> = new WeakSet(),
) {
  if (typeof data === 'object' && data !== null) {
    if (visited.has(data)) {
      return dirtyFieldsFromValues || {};
    }
    visited.add(data);
  }
  if (!dirtyFieldsFromValues) {
    dirtyFieldsFromValues = markFieldsDirty(formValues, {}, visited);
  }

  for (const key in data) {
    const value = data[key];

    if (isTraversable(value)) {
      if (isUndefined(formValues) || isPrimitive(dirtyFieldsFromValues[key])) {
        dirtyFieldsFromValues[key] = markFieldsDirty(
          value,
          Array.isArray(value) ? [] : {},
          visited,
        );
      } else {
        getDirtyFields(
          value,
          isNullOrUndefined(formValues) ? {} : formValues[key],
          dirtyFieldsFromValues[key],
          visited,
        );
      }
    } else {
      const formValue = formValues[key];
      dirtyFieldsFromValues[key] = !deepEqual(value, formValue);
    }
  }

  return pruneDirtyFields(dirtyFieldsFromValues) || {};
}
