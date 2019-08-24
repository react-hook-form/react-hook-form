import set from '../utils/set';
import { FieldValues, FieldValue } from '../types';

export default (data: FieldValues): FieldValue =>
  Object.entries(data).reduce(
    (previous: FieldValues, [key, value]): FieldValue => {
      if (key.match(/\[\d+\]/gi) || key.indexOf('.')) {
        set(previous, key, value);
        return previous;
      }

      return { ...previous, [key]: value };
    },
    {},
  );
