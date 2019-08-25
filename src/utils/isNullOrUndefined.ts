import isUndefined from './isUndefined';

export default (value: unknown): value is null | undefined =>
  value === null || isUndefined(value);
