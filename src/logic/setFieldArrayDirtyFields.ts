import { get } from '../utils';
import isArray from '../utils/isArray';
import set from '../utils/set';

const setFieldArrayDirtyFields = (
  values: any,
  defaultValues: any,
  dirtyFields: any,
) => {
  let i = 0;

  for (const value of values) {
    for (const key in value) {
      if (isArray(value[key])) {
        dirtyFields[i][key] = [];

        setFieldArrayDirtyFields(
          value[key],
          get(defaultValues[i], key, []),
          dirtyFields[i][key],
        );
      } else {
        if (defaultValues[i] && get(defaultValues[i], key) === value[key]) {
          dirtyFields[i] && set(dirtyFields[i], key, undefined);
        } else {
          dirtyFields[i] = {
            ...dirtyFields[i],
            [key]: true,
          };
        }
      }
    }
    i++;
  }

  return dirtyFields;
};

export { setFieldArrayDirtyFields };
