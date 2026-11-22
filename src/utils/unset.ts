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
  onValueRemoved?: () => void,
): T {
  if (!isObject(object) && !Array.isArray(object)) {
    return object;
  }

  if (isString(path) && Object.prototype.hasOwnProperty.call(object, path)) {
    delete (object as Record<string, unknown>)[path];
    if (onValueRemoved && !Object.prototype.hasOwnProperty.call(object, path)) {
      onValueRemoved();
    }
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

  if (childObject && (isObject(childObject) || Array.isArray(childObject))) {
    const hadOwnValue =
      onValueRemoved && Object.prototype.hasOwnProperty.call(childObject, key);
    delete (childObject as Record<string | number, unknown>)[key];
    if (
      hadOwnValue &&
      !Object.prototype.hasOwnProperty.call(childObject, key)
    ) {
      onValueRemoved?.();
    }
  }

  if (
    index !== 0 &&
    ((isObject(childObject) && isEmptyObject(childObject)) ||
      (Array.isArray(childObject) && isEmptyArray(childObject)))
  ) {
    unset(object, paths.slice(0, -1), onValueRemoved);
  }

  return object;
}
