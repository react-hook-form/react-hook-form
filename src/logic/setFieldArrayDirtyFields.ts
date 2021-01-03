import { get } from '../utils';
import set from '../utils/set';
import { deepMerge } from '../utils/deepMerge';

function setDirtyFields<
  T extends Record<string, unknown>[],
  U extends Record<string, unknown>[],
  K extends Record<string, boolean | []>
>(
  values: T,
  defaultValues: U,
  dirty: Record<string, boolean | []>[],
  parentNode?: K,
  parentName?: keyof K,
) {
  let index = -1;

  while (++index < values.length) {
    for (const key in values[index]) {
      if (Array.isArray(values[index][key])) {
        !dirty[index] && (dirty[index] = {});
        dirty[index][key] = [];
        setDirtyFields(
          values[index][key] as T,
          get(defaultValues[index] || {}, key, []),
          dirty[index][key] as [],
          dirty[index],
          key,
        );
      } else {
        get(defaultValues[index] || {}, key) === values[index][key]
          ? set(dirty[index] || {}, key)
          : (dirty[index] = {
              ...dirty[index],
              [key]: true,
            });
      }
    }

    parentNode && !dirty.length && delete parentNode[parentName as keyof K];
  }

  return dirty;
}

export default <T extends U, U extends Record<string, unknown>[]>(
  values: T,
  defaultValues: U,
  dirty: Record<string, boolean | []>[],
) =>
  deepMerge(
    setDirtyFields(values, defaultValues, dirty.slice(0, values.length)),
    setDirtyFields(defaultValues, values, dirty.slice(0, values.length)),
  );
