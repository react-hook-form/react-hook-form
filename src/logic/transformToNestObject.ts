import set from '../utils/set';
import { REGEX_IS_DEEP_PROP } from '../constants';
import { FieldValues } from '../types';

export default (data: FieldValues): any =>
  Object.entries(data).reduce(
    (previous: FieldValues, [key, value]): FieldValues => {
      if (REGEX_IS_DEEP_PROP.test(key)) {
        set(previous, key, value);
        return previous;
      }

      return { ...previous, [key]: value };
    },
    {},
  );
