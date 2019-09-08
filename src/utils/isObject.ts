import isNullOrUndefined from './isNullOrUndefined';
import isArray from './isArray';

export default (value: unknown): value is object =>
  !isNullOrUndefined(value) && !isArray(value) && typeof value === 'object';
