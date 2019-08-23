import isNullOrUndefined from './isNullOrUndefined';

export default (value: unknown): value is object =>
  !isNullOrUndefined(value) &&
  !Array.isArray(value) &&
  typeof value === 'object';
