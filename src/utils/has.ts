import isKey from './isKey';
import { isObjectType } from './isObject';
import stringToPath from './stringToPath';

const hasOwn = (value: unknown, key: string) =>
  value !== null &&
  isObjectType(value) &&
  Object.prototype.hasOwnProperty.call(value, key);

export default <T>(object: T, path?: string | null): boolean => {
  if (!path) {
    return false;
  }

  let result: unknown = object;

  for (const key of isKey(path) ? [path] : stringToPath(path)) {
    if (!hasOwn(result, key)) {
      // `get` also resolves a path held as a single literal key, eg `{ 'a.b': 1 }`
      return hasOwn(object, path);
    }

    result = (result as Record<string, unknown>)[key];
  }

  return true;
};
