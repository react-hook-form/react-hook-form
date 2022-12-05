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
      if (
        Array.isArray(data[key]) ||
        (isObject(data[key]) && !objectHasFunction(data[key]))
      ) {
        fields[key] = Array.isArray(data[key]) ? [] : {};
        markFieldsDirty(data[key], fields[key]);
      } else if (!isNullOrUndefined(data[key])) {
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
      if (
        Array.isArray(data[key]) ||
        (isObject(data[key]) && !objectHasFunction(data[key]))
      ) {
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
        deepEqual(data[key], formValues[key])
          ? delete dirtyFieldsFromValues[key]
          : (dirtyFieldsFromValues[key] = true);
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
