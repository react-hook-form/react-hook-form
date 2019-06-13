import { FieldValue } from '../types';

export default function combineFieldValues(data): FieldValue {
  const output = Object.entries(data).reduce(
    (previous, [key, value]): FieldValue => {
      const arrayIndex = key.match(/\[\d+\]/gi);
      const isObjectArray = /^\S+\[\d+\]\.\S+$/gi.test(key);
      const isObject = /[a-z0-9_]+\.[a-z0-9_]+/gi.test(key);
      const dotPosition = key.indexOf('.');

      if (arrayIndex) {
        const fieldName = key.substr(0, key.indexOf('['));
        const index = arrayIndex[0].slice(1, -1);
        if (!previous[fieldName]) previous[fieldName] = [];

        if (isObjectArray) {
          const attributeName = key.substr(dotPosition + 1);
          previous[fieldName][index] = {
            ...previous[fieldName][index],
            [attributeName]: value,
          };
        } else {
          previous[fieldName][index] = value;
        }

        return previous;
      }

      if (isObject) {
        const fieldName = key.substr(0, dotPosition);
        const attributeName = key.substr(dotPosition + 1);
        if (!previous[fieldName]) previous[fieldName] = {};
        previous[fieldName][attributeName] = value;
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
