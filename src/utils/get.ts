import isUndefined from './isUndefined';
import isNullOrUndefined from './isNullOrUndefined';

export default (obj: any, path: string, defaultValue?: any) => {
  const result = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce(
      (result, key) => (isNullOrUndefined(result) ? result : result[key]),
      obj,
    );
  return isUndefined(result) || result === obj ? defaultValue : result;
};
