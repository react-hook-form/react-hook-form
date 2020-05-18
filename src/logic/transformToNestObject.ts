import set from '../utils/set';
import isKey from '../utils/isKey';
import { FieldValues } from '../types/types';

export default (data: FieldValues): any =>
  Object.entries(data).reduce(
    (previous: FieldValues, [key, value]): FieldValues => {
      if (!isKey(key)) {
        set(previous, key, value);
        return previous;
      }

      return { ...previous, [key]: value };
    },
    {},
  );
