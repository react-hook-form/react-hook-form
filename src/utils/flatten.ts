import type { FieldValues } from '../types';

import isDateObject from './isDateObject';
import isFunction from './isFunction';
import { isObjectType } from './isObject';

const isFileLike = (value: unknown) =>
  (typeof Blob !== 'undefined' && value instanceof Blob) ||
  (typeof File !== 'undefined' && value instanceof File);

const isFileListLike = (value: unknown) =>
  typeof FileList !== 'undefined' && value instanceof FileList;

export const flatten = (obj: FieldValues) => {
  const output: FieldValues = {};

  for (const key of Object.keys(obj)) {
    if (
      isObjectType(obj[key]) &&
      obj[key] !== null &&
      !isDateObject(obj[key]) &&
      !isFileLike(obj[key]) &&
      !isFileListLike(obj[key])
    ) {
      let value = obj[key];

      if ('toJSON' in value && isFunction(value.toJSON)) {
        value = value.toJSON();

        if (
          !isObjectType(value) ||
          value === null ||
          isDateObject(value) ||
          isFileLike(value) ||
          isFileListLike(value)
        ) {
          output[key] = value;
          continue;
        }
      }

      const nested = flatten(value);

      for (const nestedKey of Object.keys(nested)) {
        output[`${key}.${nestedKey}`] = nested[nestedKey];
      }
    } else {
      output[key] = obj[key];
    }
  }

  return output;
};
