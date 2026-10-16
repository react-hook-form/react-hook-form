import { PROTOTYPE_KEYWORDS } from '../constants';

import isKey from './isKey';
import isNullOrUndefined from './isNullOrUndefined';
import isObject from './isObject';
import isUndefined from './isUndefined';
import stringToPath from './stringToPath';

export default <T, TResult = unknown>(
  object: T,
  path?: string | null,
  defaultValue?: unknown,
): TResult => {
  if (!path || !isObject(object)) {
    return defaultValue as TResult;
  }

  const paths = isKey(path) ? [path] : stringToPath(path);
  if (paths.some((key) => PROTOTYPE_KEYWORDS.includes(key))) {
    return defaultValue as TResult;
  }

  const result = paths.reduce<unknown>((result, key) => {
    return isNullOrUndefined(result)
      ? undefined
      : (result as Record<string, unknown>)[key];
  }, object);

  return (
    isUndefined(result) || result === object
      ? isUndefined(object[path as keyof T])
        ? defaultValue
        : object[path as keyof T]
      : result
  ) as TResult;
};
