import set from './set';
import isObject from './isObject';
import isArray from './isArray';
import isUndefined from './isUndefined';
import isEmptyObject from './isEmptyObject';

const unsetObject = (target: any) => {
  for (const key in target) {
    const isArrayObject = isArray(target[key]);

    if ((isObject(target[key]) || isArrayObject) && !target[key].ref) {
      unsetObject(target[key]);
    }

    if (isArrayObject) {
      target[key] = target[key].filter(Boolean);
    }

    if (
      isUndefined(target[key]) ||
      isEmptyObject(target[key]) ||
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
