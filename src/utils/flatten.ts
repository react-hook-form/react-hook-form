import type { FieldValues } from '../types';

import isDateObject from './isDateObject';
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
