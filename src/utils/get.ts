import compact from './compact';
import isNullOrUndefined from './isNullOrUndefined';
import isUndefined from './isUndefined';

export default <T extends Record<string, any>, U = undefined>(
  obj: T | undefined,
  path: string,
  defaultValue?: U,
): any => {
  if (!obj || !path) {
    return defaultValue;
  }

  const result = compact(path.split(/[,[\].]+?/)).reduce(
    (result, key) =>
      isNullOrUndefined(result) ? result : result[key as keyof {}],
    obj,
  );

  return isUndefined(result) || result === obj
    ? isUndefined(obj[path as keyof T])
      ? defaultValue
      : obj[path as keyof T]
    : result;
};
