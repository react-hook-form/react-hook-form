import { get } from '../utils';
import set from '../utils/set';
import { deepMerge } from '../utils/deepMerge';
import deepEqual from '../utils/deepEqual';

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
          values[index][key] as T,
          get(defaultValues[index] || {}, key, []),
          dirtyFields[index][key] as [],
          dirtyFields[index],
          key,
        );
      } else {
        deepEqual(get(defaultValues[index] || {}, key), values[index][key])
          ? set(dirtyFields[index] || {}, key)
          : (dirtyFields[index] = {
              ...dirtyFields[index],
              [key]: true,
            });
      }
    }

    parentNode &&
      !dirtyFields.length &&
      delete parentNode[parentName as keyof K];
  }

  return dirtyFields;
}

export default <T extends U, U extends Record<string, unknown>[]>(
  values: T,
  defaultValues: U,
  dirtyFields: Record<string, boolean | []>[],
) =>
  deepMerge(
    setDirtyFields(values, defaultValues, dirtyFields.slice(0, values.length)),
    setDirtyFields(defaultValues, values, dirtyFields.slice(0, values.length)),
  );
