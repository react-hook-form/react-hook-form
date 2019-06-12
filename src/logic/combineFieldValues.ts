import { FieldValue } from '../types';

export default function combineFieldValues(data): FieldValue {
  const output = Object.entries(data).reduce(
    (previous, [key, value]): FieldValue => {
      const arrayIndex = key.match(/\[\d+\]$/gi);

      if (arrayIndex) {
        const index = arrayIndex[0].slice(1, -1);
        const filedName = key.substr(0, key.indexOf('['));
        if (!previous[filedName]) previous[filedName] = [];
        previous[filedName][index] = value;
      } else if (key.startsWith('{') && key.endsWith('}')) {
        try {
          const obj = JSON.parse(key);
          const objKey = obj[0];
          const objValue = obj[objKey];
          previous[objKey][objValue] = value;
        } catch (e) {
          console.error(`Fields name paring error: ${e}`);
        }
      } else {
        previous[key] = value;
      }
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
