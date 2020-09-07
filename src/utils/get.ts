import isUndefined from './isUndefined';
import isNullOrUndefined from './isNullOrUndefined';
import filterOutFalsy from './filterOutFalsy';

export default (obj: any, path: string, defaultValue?: unknown) => {
  const result = filterOutFalsy(path.split(/[,[\].]+?/)).reduce(
    (result, key) => (isNullOrUndefined(result) ? result : result[key]),
    obj,
  );

  return isUndefined(result) || result === obj
    ? isUndefined(obj[path])
      ? defaultValue
      : obj[path]
    : result;
};
