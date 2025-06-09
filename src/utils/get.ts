import isKey from './isKey';
import isNullOrUndefined from './isNullOrUndefined';
import isObject from './isObject';
import isUndefined from './isUndefined';
import stringToPath from './stringToPath';

export default <T>(
  object: T,
  path?: string | null,
  defaultValue?: unknown,
): any => {
  if (!path || !isObject(object)) {
    return defaultValue;
  }

  const result = (isKey(path) ? [path] : stringToPath(path)).reduce(
    (result, key) =>
      isNullOrUndefined(result) ? result : result[key as keyof {}],
    object,
  );

  return isUndefined(result) || result === object
    ? isUndefined(object[path as keyof T])
      ? defaultValue
      : object[path as keyof T]
    : result;
};
