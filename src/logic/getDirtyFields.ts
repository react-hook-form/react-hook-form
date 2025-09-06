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
    } else if (!isNullOrUndefined(data[key])) {
      fields[key] = true;
    }
  }

  return fields;
}

function getDirtyFieldsFromDefaultValues<T>(
  data: T,
  formValues: T,
  dirtyFieldsFromValues: Record<
    Extract<keyof T, string>,
    ReturnType<typeof markFieldsDirty> | boolean
  >,
) {
  if (isTraversable(data)) {
    for (const key in data) {
      if (isTraversable(data[key])) {
        if (
          isUndefined(formValues) ||
          isPrimitive(dirtyFieldsFromValues[key])
        ) {
          dirtyFieldsFromValues[key] = Array.isArray(data[key])
            ? markFieldsDirty(data[key], [])
            : { ...markFieldsDirty(data[key]) };
        } else {
          getDirtyFieldsFromDefaultValues(
            data[key],
            isNullOrUndefined(formValues) ? {} : formValues[key],
            dirtyFieldsFromValues[key],
          );
        }
      } else {
        dirtyFieldsFromValues[key] = !deepEqual(data[key], formValues[key]);
      }
    }
  }

  return dirtyFieldsFromValues;
}

export default <T>(defaultValues: T, formValues: T) =>
  getDirtyFieldsFromDefaultValues(
    defaultValues,
    formValues,
    markFieldsDirty(formValues),
  );
