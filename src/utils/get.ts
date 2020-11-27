import isUndefined from './isUndefined';
import isNullOrUndefined from './isNullOrUndefined';
import compact from './compact';

export default (obj: any = {}, path: string, defaultValue?: unknown) => {
  const result = compact(path.split(/[,[\].]+?/)).reduce(
    (result, key) => (isNullOrUndefined(result) ? result : result[key]),
    obj,
  );

  return isUndefined(result) || result === obj
    ? isUndefined(obj[path])
      ? defaultValue
      : obj[path]
    : result;
};
