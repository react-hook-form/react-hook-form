import deepEqual from '../utils/deepEqual';
import isNullOrUndefined from '../utils/isNullOrUndefined';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';
import isUndefined from '../utils/isUndefined';
import objectHasFunction from '../utils/objectHasFunction';

function markFieldsDirty<U>(data: U, fields: Record<string, any> = {}) {
  const isParentNodeArray = Array.isArray(data);

  if (isObject(data) || isParentNodeArray) {
    for (const key in data) {
      const value = data[key];

      if (
        Array.isArray(value) ||
        (isObject(value) && !objectHasFunction(value))
      ) {
        fields[key] = Array.isArray(value) ? [] : {};
        markFieldsDirty(data[key], fields[key]);
      } else if (!isNullOrUndefined(value)) {
        fields[key] = true;
      }
    }
  }

  return fields;
}

function getDirtyFieldsFromDefaultValues<T>(
  data: T,
  formValues: T,
  dirtyFieldsFromValues: any,
) {
  const isParentNodeArray = Array.isArray(data);

  if (isObject(data) || isParentNodeArray) {
    for (const key in data) {
      const value = data[key];

      if (
        Array.isArray(value) ||
        (isObject(value) && !objectHasFunction(value))
      ) {
        if (
          isUndefined(formValues) ||
          isPrimitive(dirtyFieldsFromValues[key])
        ) {
          dirtyFieldsFromValues[key] = Array.isArray(value)
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
        dirtyFieldsFromValues[key] = !deepEqual(value, formValues[key]);
      }
    }
  }

  return dirtyFieldsFromValues;
}

export default function getDirtyFields<T>(defaultValues: T, formValues: T) {
  const dirtyFieldsFromValues = markFieldsDirty(formValues);

  return getDirtyFieldsFromDefaultValues(
    defaultValues,
    formValues,
    dirtyFieldsFromValues,
  );
}
