import { get } from '../utils';
import isArray from '../utils/isArray';
import set from '../utils/set';

export default function setFieldArrayDirtyFields<
  T extends U,
  U extends Record<string, unknown>[]
>(
  values: T,
  defaultValues: U,
  dirtyFields: Record<string, boolean | []>[],
  parentNode?: any,
  parentName?: any,
) {
  let index = -1;

  while (++index < values.length) {
    for (const key in values[index]) {
      if (isArray(values[index][key])) {
        !dirtyFields[index] && (dirtyFields[index] = {});
        dirtyFields[index][key] = [];
        setFieldArrayDirtyFields(
          values[index][key],
          get(defaultValues[index] || {}, key, []),
          dirtyFields[index][key] as [],
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
    !dirtyFields.length && delete parentNode[parentName];
  }

  return dirtyFields.length ? dirtyFields : undefined;
}
