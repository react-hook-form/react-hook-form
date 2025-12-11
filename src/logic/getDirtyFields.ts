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
    const value = data[key];

    if (isTraversable(value)) {
      fields[key] = Array.isArray(value) ? [] : {};
      markFieldsDirty(value, fields[key]);
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
) {
  if (!dirtyFieldsFromValues) {
    dirtyFieldsFromValues = markFieldsDirty(formValues);
  }

  for (const key in data) {
    const value = data[key];

    if (isTraversable(value)) {
      if (isUndefined(formValues) || isPrimitive(dirtyFieldsFromValues[key])) {
        dirtyFieldsFromValues[key] = markFieldsDirty(
          value,
          Array.isArray(value) ? [] : {},
        );
      } else {
        getDirtyFields(
          value,
          isNullOrUndefined(formValues) ? {} : formValues[key],
          dirtyFieldsFromValues[key],
        );
      }
    } else {
      const formValue = formValues[key];
      dirtyFieldsFromValues[key] = !deepEqual(value, formValue);
    }
  }

  return dirtyFieldsFromValues;
}
