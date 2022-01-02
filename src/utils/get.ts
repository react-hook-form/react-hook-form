import compact from './compact';
import isNullOrUndefined from './isNullOrUndefined';
import isObject from './isObject';
import isUndefined from './isUndefined';

export default <T>(obj: T, path: string, defaultValue?: unknown): any => {
  if (isObject(obj) && path) {
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
  }

  return undefined;
};
