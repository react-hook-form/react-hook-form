import deepEqual from '../utils/deepEqual';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';
import isUndefined from '../utils/isUndefined';
import objectHasFunction from '../utils/objectHasFunction';

function isTraversable(value: any): boolean {
  return Array.isArray(value) || (isObject(value) && !objectHasFunction(value));
}

function markFieldsDirty<T>(data: T, fields: Record<string, any> = {}) {
  for (const key in data) {
    if (isTraversable(data[key])) {
      fields[key] = Array.isArray(data[key]) ? [] : {};
      markFieldsDirty(data[key], fields[key]);
    } else if (!isUndefined(data[key])) {
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
) {
  if (!dirtyFieldsFromValues) {
    dirtyFieldsFromValues = markFieldsDirty(formValues);
  }

  for (const key in data) {
    if (isTraversable(data[key])) {
      if (isUndefined(formValues) || isPrimitive(dirtyFieldsFromValues[key])) {
        dirtyFieldsFromValues[key] = markFieldsDirty(
          data[key],
          Array.isArray(data[key]) ? [] : {},
        );
      } else {
        getDirtyFields(
          data[key],
          isNullOrUndefined(formValues) ? {} : formValues[key],
          dirtyFieldsFromValues[key],
        );
      }
    } else {
      dirtyFieldsFromValues[key] = !deepEqual(data[key], formValues[key]);
    }
  }

  return dirtyFieldsFromValues;
}
