import set from '../utils/set';
import { FieldValues } from '../types';

export default (data: FieldValues): any =>
  Object.entries(data).reduce(
    (previous: FieldValues, [key, value]): FieldValues => {
      if (!!key.match(/\[.+\]/gi) || key.indexOf('.') > 0) {
        set(previous, key, value);
        return previous;
      }

      return { ...previous, [key]: value };
    },
    {},
  );
