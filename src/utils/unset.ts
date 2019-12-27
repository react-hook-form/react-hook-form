import set from './set';
import isObject from './isObject';
import isArray from './isArray';
import isUndefined from './isUndefined';
import isEmptyObject from './isEmptyObject';

const unsetObject = (target: any) => {
  for (const key in target) {
    if ((isObject(target[key]) || isArray(target[key])) && !target[key].ref) {
      unsetObject(target[key]);
    }

    if (isUndefined(target[key]) || isEmptyObject(target[key])) {
      delete target[key];
    }

    if (isArray(target[key])) {
      target[key] = target[key].filter(Boolean);
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
