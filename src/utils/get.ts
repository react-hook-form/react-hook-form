import compact from './compact';
import isNullOrUndefined from './isNullOrUndefined';
import isObject from './isObject';
import isUndefined from './isUndefined';

export default <T>(obj: T, path: string, defaultValue?: unknown) => {
  if (isObject(obj) && path) {
    const result = compact(path.split(/[,[\].]+?/)).reduce(
      (result, key) => (isNullOrUndefined(result) ? result : result[key]),
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
