import set from './set';
import isObject from './isObject';
import isArray from './isArray';
import isUndefined from './isUndefined';
import isEmptyObject from './isEmptyObject';

const unsetObject = (target: any) => {
  for (const key in target) {
    const data = target[key];
    const isArrayObject = isArray(data);

    if ((isObject(data) || isArrayObject) && !data.ref) {
      unsetObject(data);
    }

    if (isArrayObject) {
      target[key] = data.filter(Boolean);
    }

    if (
      isUndefined(data) ||
      isEmptyObject(data) ||
      (isArrayObject && !target[key].length)
    ) {
      delete target[key];
    }
  }

  return target;
};

const unset = (target: any, paths: string[]) => {
  paths.forEach(path => {
    set(target, path, undefined);
  });
  return unsetObject(target);
};

export default unset;
