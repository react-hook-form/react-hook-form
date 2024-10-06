import { FieldValues } from '../types';

export const flatten = (obj: FieldValues) => {
  const output: FieldValues = {};

  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'object') {
      const nested = flatten(obj[key]);

      for (const nestedKey of Object.keys(nested)) {
        output[`${key}.${nestedKey}`] = nested[nestedKey];
      }
    } else {
      output[key] = obj[key];
    }
  }

  return output;
};
