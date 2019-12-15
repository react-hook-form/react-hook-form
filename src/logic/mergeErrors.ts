import isObject from '../utils/isObject';

const merge = (target: any, source: any) => {
  for (const key of Object.keys(source)) {
    if (isObject(source[key]) && !source[key].ref) {
      Object.assign(source[key], merge(target[key], source[key]));
    }
  }

  Object.assign(target || {}, source);
  return target;
};

export default merge;
