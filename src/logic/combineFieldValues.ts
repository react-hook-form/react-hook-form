import set from '../utils/set';
import { DataType, FieldValue } from '../types';

export default (data: DataType): FieldValue =>
  Object.entries(data).reduce(
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
