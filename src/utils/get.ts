import isUndefined from './isUndefined';
import isNullOrUndefined from './isNullOrUndefined';
import uniq from './uniq';

export default (obj: any, path: string, defaultValue?: unknown) => {
  const result = uniq(path.split(/[,[\].]+?/)).reduce(
    (result, key) => (isNullOrUndefined(result) ? result : result[key]),
    obj,
  );

  return isUndefined(result) || result === obj
    ? isUndefined(obj[path])
      ? defaultValue
      : obj[path]
    : result;
};
