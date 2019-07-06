import isObject from './isObject';
import { DataType } from '../types';

const reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
const reIsPlainProp = /^\w*$/;
const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
const reEscapeChar = /\\(\\)?/g;
const reIsUint = /^(?:0|[1-9]\d*)$/;
const isArray = Array.isArray;

function isIndex(value: any) {
  return reIsUint.test(value) && value > -1;
}

export function isKey(value: any) {
  if (isArray(value)) return false;
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value);
}

const stringToPath = (string: string) => {
  const result: string[] = [];
  string.replace(
    rePropName,
    (match: string, number: string, quote: string, string: string): any => {
      result.push(quote ? string.replace(reEscapeChar, '$1') : number || match);
    },
  );
  return result;
};

export default function set(object: DataType, path: any, value: string) {
  path = isKey(path) ? [path] : stringToPath(path);

  let index = -1;
  const length = path.length;
  const lastIndex = length - 1;

  while (++index < length) {
    let key = path[index];
    let newValue = value;

    if (index != lastIndex) {
      const objValue = object[key];
      newValue = isObject(objValue)
        ? objValue
        : isIndex(path[index + 1])
        ? []
        : {};
    }
    object[key] = newValue;
    object = object[key];
  }
  return object;
}
