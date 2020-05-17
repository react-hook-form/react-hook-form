import isUndefined from './isUndefined';
import isNullOrUndefined from './isNullOrUndefined';
import unique from './unique';

export default (obj: any, path: string, defaultValue?: any) => {
  const result = unique(path.split(/[,[\].]+?/)).reduce(
    (result, key) => (isNullOrUndefined(result) ? result : result[key]),
    obj,
  );

  return isUndefined(result) || result === obj
    ? isUndefined(obj[path])
      ? defaultValue
      : obj[path]
    : result;
};
