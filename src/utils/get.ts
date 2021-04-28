import compact from './compact';
import isNullOrUndefined from './isNullOrUndefined';
import isString from './isString';
import isUndefined from './isUndefined';

export default <T extends Record<string, any>>(
  obj: T,
  path: string,
  defaultValue?: unknown,
) => {
  const result = isString(path)
    ? compact(path.split(/[,[\].]+?/)).reduce(
        (result, key) => (isNullOrUndefined(result) ? result : result[key]),
        obj,
      )
    : undefined;

  return isUndefined(result) || result === obj
    ? isUndefined(obj[path])
      ? defaultValue
      : obj[path]
    : result;
};
