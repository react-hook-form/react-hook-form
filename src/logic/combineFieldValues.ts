import { FieldValue } from '../types';

export default function combineFieldValues(data): FieldValue {
  const output = Object.entries(data).reduce(
    (previous, [key, value]): FieldValue => {
      const arrayIndex = key.match(/\[\d+\]$/gi);
      const isObjectArray = /^\S+\[\d+\]\.\S+$/gi.test(key);
      const isObject = /[a-z0-9_]+\.[a-z0-9_]+/gi.test(key);

      if (arrayIndex) {
        const index = arrayIndex[0].slice(1, -1);
        const fieldName = key.substr(0, key.indexOf('['));

        if (isObjectArray) {
          const attributeName = key.substr(key.indexOf('.'));
          if (!previous[fieldName]) previous[fieldName] = {};
          previous[fieldName][index] = {
            [attributeName]: value,
          };
        } else {
          if (!previous[fieldName]) previous[fieldName] = [];
          previous[fieldName][index] = value;
        }

        return previous;
      }

      if (isObject) {

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
