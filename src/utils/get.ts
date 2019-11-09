import isUndefined from './isUndefined';

export default (obj: any, path: string, defaultValue?: any) => {
  const result = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((result, key) => result ?? result[key], obj);
  return isUndefined(result) || result === obj ? defaultValue : result;
};
