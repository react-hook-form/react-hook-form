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

  if (isUndefined(result) || result === obj) {
    if (!obj[path] && obj[path] !== '') {
      return defaultValue;
    }

    return obj[path];
  }

  return result;
};
