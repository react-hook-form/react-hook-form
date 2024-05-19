import { FieldValues } from '../types';

import isKey from './isKey';
import isObject from './isObject';
import stringToPath from './stringToPath';

/**
 * Sets the value at the specified path of the object.
 * If a portion of the path does not exist, it is created.
 * @example
 * ```typescript
 * const object = {};
 * setValueAtPath(object, 'a.b.c', 42);
 * Output: { a: { b: { c: 42 } } }
 * ```
 */
export default (object: FieldValues, path: string, value?: unknown) => {
  let index = -1;
  const tempPath = isKey(path) ? [path] : stringToPath(path);
  const length = tempPath.length;
  const lastIndex = length - 1;

  while (++index < length) {
    const key = tempPath[index];
    let newValue = value;

    if (index !== lastIndex) {
      const objValue = object[key];
      newValue =
        isObject(objValue) || Array.isArray(objValue)
          ? objValue
          : !isNaN(+tempPath[index + 1])
          ? []
          : {};
    }
    object[key] = newValue;
    object = object[key];
  }
  return object;
};
