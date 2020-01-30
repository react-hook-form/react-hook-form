import isArray from './isArray';

export default (value: any) =>
  isArray(value) ? value.map(() => null) : undefined;
