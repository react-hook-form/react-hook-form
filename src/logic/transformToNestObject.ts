import set from '../utils/set';
import isObjectString from '../utils/isObjectString';
import { FieldValues } from '../types';

export default (data: FieldValues): any =>
  Object.entries(data).reduce(
    (previous: FieldValues, [key, value]): FieldValues => {
      if (isObjectString(key)) {
        set(previous, key, value);
        return previous;
      }

      return { ...previous, [key]: value };
    },
    {},
  );
