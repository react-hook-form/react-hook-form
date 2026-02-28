import deepEqual from '../utils/deepEqual';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';
import isUndefined from '../utils/isUndefined';
import objectHasFunction from '../utils/objectHasFunction';

function isTraversable(value: any): boolean {
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

  return dirtyFieldsFromValues;
}
