import set from '../utils/set';
import { DataType, FieldValue } from '../types';

export default function combineFieldValues(data: DataType): FieldValue {
  const output = Object.entries(data).reduce(
    (previous: DataType, [key, value]): FieldValue => {
      if (key.match(/\[\d+\]/gi) || key.indexOf('.')) {
        set(previous, key, value);
        return previous;
      }

      previous[key] = value;
      return previous;
    },
    {},
  );

  return Object.entries(output).reduce(
    (previous: DataType, [key, value]): FieldValue => {
      previous[key] = Array.isArray(value) ? value.filter(Boolean) : value;
      return previous;
    },
    {},
  );
}
