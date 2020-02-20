import isObject from './isObject';
import isArray from './isArray';
import isKey from './isKey';
import stringToPath from './stringToPath';
import { FieldValues } from '../types';

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
