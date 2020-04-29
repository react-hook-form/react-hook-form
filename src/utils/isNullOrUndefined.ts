import isUndefined from './isUndefined';

export default (value: any): value is null | undefined =>
  value === null || isUndefined(value);
