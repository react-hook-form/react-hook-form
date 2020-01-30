import isArray from './isArray';

export default (value: any) =>
  isArray(value) ? Array(value.length).fill(null) : undefined;
