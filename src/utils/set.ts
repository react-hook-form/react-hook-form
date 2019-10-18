import isObject from './isObject';
import isArray from './isArray';
import { FieldValues } from '../types';

const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
const reEscapeChar = /\\(\\)?/g;
const reIsUint = /^(?:0|[1-9]\d*)$/;

function isIndex(value: any) {
  return reIsUint.test(value) && value > -1;
}

export function isKey(value: [] | string) {
  if (isArray(value)) {
    return false;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value);
}

const stringToPath = (string: string): string[] => {
  const result: string[] = [];

  string.replace(
    rePropName,
    (match: string, number: string, quote: string, string: string): any => {
      result.push(quote ? string.replace(reEscapeChar, '$1') : number || match);
    },
  );

  return result;
};

export default function set(object: FieldValues, path: string, value: string) {
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
          : isIndex(tempPath[index + 1])
          ? []
          : {};
    }
    object[key] = newValue;
    object = object[key];
  }
  return object;
}
