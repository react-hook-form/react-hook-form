import { get } from '../utils';
import isArray from '../utils/isArray';
import set from '../utils/set';

const setFieldArrayDirtyFields = <
  T extends Record<string, any>[],
  U extends Record<string, any>[]
>(
  values: T,
  defaultValues: U,
  dirtyFields: Record<string, boolean | []>[],
) => {
  let index = 0;

  for (const value of values) {
    for (const key in value) {
      if (isArray(value[key])) {
        dirtyFields[index][key] = [];
        setFieldArrayDirtyFields(
          value[key],
          get(defaultValues[index], key, []),
          dirtyFields[index][key] as [],
        );
      } else {
        if (
          defaultValues[index] &&
          get(defaultValues[index], key) === value[key]
        ) {
          dirtyFields[index] && set(dirtyFields[index], key, undefined);
        } else {
          dirtyFields[index] = {
            ...dirtyFields[index],
            [key]: true,
          };
        }
      }
    }
    index++;
  }

  return dirtyFields;
};

export { setFieldArrayDirtyFields };
