import isObject from './isObject';

export default (value: unknown): boolean =>
  isObject(value) && !Object.keys(value).length;
