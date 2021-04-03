import compact from './compact';
import isNullOrUndefined from './isNullOrUndefined';
import isUndefined from './isUndefined';

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
