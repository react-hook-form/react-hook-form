import isObject from './isObject';
import isArray from './isArray';
import {
  REGEX_ESCAPE_CHAR,
  REGEX_IS_DEEP_PROP,
  REGEX_IS_PLAIN_PROP,
  REGEX_PROP_NAME,
} from '../constants';
import { FieldValues } from '../types';

export const isKey = (value: [] | string) =>
  !isArray(value) &&
  (REGEX_IS_PLAIN_PROP.test(value) || !REGEX_IS_DEEP_PROP.test(value));

const stringToPath = (string: string): string[] => {
  const result: string[] = [];

  string.replace(
    REGEX_PROP_NAME,
    (match: string, number: string, quote: string, string: string): any => {
      result.push(
        quote ? string.replace(REGEX_ESCAPE_CHAR, '$1') : number || match,
      );
    },
  );

  return result;
};

export default function set(object: FieldValues, path: string, value: any) {
  let index = -1;
  const tempPath = isKey(path) ? [path] : stringToPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;

  while (++index < length) {
    const key = tempPath[index];
    let newValue: string | object = value;

    if (index !== lastIndex) {
      const objValue = object[key];
      newValue =
        isObject(objValue) || isArray(objValue)
          ? objValue
          : !isNaN(tempPath[index + 1] as any)
          ? []
          : {};
    }
    object[key] = newValue;
    object = object[key];
  }
  return object;
}
