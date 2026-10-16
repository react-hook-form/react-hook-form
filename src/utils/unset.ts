import { PROTOTYPE_KEYWORDS } from '../constants';

import isEmptyObject from './isEmptyObject';
import isKey from './isKey';
import isNullOrUndefined from './isNullOrUndefined';
import isObject from './isObject';
import isString from './isString';
import isUndefined from './isUndefined';
import stringToPath from './stringToPath';

function baseGet(object: unknown, updatePath: (string | number)[]) {
  const length = updatePath.length - 1;
  let index = 0;

  while (index < length) {
    if (isNullOrUndefined(object)) {
      object = undefined;
      break;
    }
    object = (object as Record<string | number, unknown>)[updatePath[index]];
    index++;
  }

  return object;
}

function isEmptyArray(obj: unknown[]) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && !isUndefined(obj[key])) {
      return false;
    }
  }
  return true;
}

export default function unset<T>(
  object: T,
  path: string | (string | number)[],
): T {
  if (isString(path) && Object.prototype.hasOwnProperty.call(object, path)) {
    delete (object as Record<string, unknown>)[path];
    return object;
  }

  const paths = Array.isArray(path)
    ? path
    : isKey(path)
      ? [path]
      : stringToPath(path);
  if (paths.some((segment) => PROTOTYPE_KEYWORDS.includes(String(segment)))) {
    return object;
  }
  const childObject = paths.length === 1 ? object : baseGet(object, paths);

  const index = paths.length - 1;
  const key = paths[index];

  if (childObject) {
    delete (childObject as Record<string | number, unknown>)[key];
  }

  if (
    index !== 0 &&
    ((isObject(childObject) && isEmptyObject(childObject)) ||
      (Array.isArray(childObject) && isEmptyArray(childObject)))
  ) {
    unset(object, paths.slice(0, -1));
  }

  return object;
}
