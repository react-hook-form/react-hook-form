import { FieldValue } from '../types';
import set from '../utils/set';

export default function combineFieldValues(data): FieldValue {
  const output = Object.entries(data).reduce(
    (previous, [key, value]): FieldValue => {
      const arrayIndex = key.match(/\[\d+\]/gi);
      const dotPosition = key.indexOf('.');

      if (arrayIndex || dotPosition) {
        set(previous, key, value);
        return previous;
      }

      previous[key] = value;
      return previous;
    },
    {},
  );

  return Object.entries(output).reduce((previous, [key, value]): FieldValue => {
    if (Array.isArray(value)) {
      previous[key] = value.filter(Boolean);
      return previous;
    }

    previous[key] = value;
    return previous;
  }, {});
}
