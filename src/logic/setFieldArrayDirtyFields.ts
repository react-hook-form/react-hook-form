import * as React from 'react';
import get from '../utils/get';
import set from '../utils/set';
import { deepMerge } from '../utils/deepMerge';
import unsetEmptyFieldArray from '../utils/unsetEmptyFieldArray';
import { DefaultValues, FormState } from '../types';

function setDirtyFields<
  T extends Record<string, unknown>[],
  U extends Record<string, unknown>[],
  K extends Record<string, boolean | []>
>(
  values: T,
  defaultValues: U,
  dirtyFields: Record<string, boolean | []>[],
  parentNode?: K,
  parentName?: keyof K,
) {
  let index = -1;

  while (++index < values.length) {
    for (const key in values[index]) {
      if (Array.isArray(values[index][key])) {
        !dirtyFields[index] && (dirtyFields[index] = {});
        dirtyFields[index][key] = [];
        setDirtyFields(
          values[index][key] as Record<string, unknown>[],
          get(defaultValues[index] || {}, key, []),
          dirtyFields[index][key] as Record<string, boolean | []>[],
          dirtyFields[index],
          key,
        );
      } else {
        get(defaultValues[index] || {}, key) === values[index][key]
          ? set(dirtyFields[index] || {}, key)
          : (dirtyFields[index] = {
              ...dirtyFields[index],
              [key]: true,
            });
      }
    }

    !dirtyFields.length &&
      parentNode &&
      parentName &&
      delete parentNode[parentName];
  }

  return dirtyFields.length ? dirtyFields : [];
}

export default function setFieldArrayDirtyFields<TFieldValues>(
  name: string,
  values: Record<string, unknown>[],
  defaultValuesRef: React.MutableRefObject<DefaultValues<TFieldValues>>,
  formStateRef: React.MutableRefObject<FormState<TFieldValues>>,
) {
  const dirtyFields = get(formStateRef.current.dirtyFields, name, []);
  const defaultValues = get(defaultValuesRef.current, name, []);

  set(
    formStateRef.current.dirtyFields,
    name,
    deepMerge(
      setDirtyFields(values, defaultValues, dirtyFields),
      setDirtyFields(defaultValues, values, dirtyFields),
    ),
  );

  unsetEmptyFieldArray(formStateRef.current.dirtyFields, name);
}
