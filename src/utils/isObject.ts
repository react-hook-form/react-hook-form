import isNullOrUndefined from './isNullOrUndefined';
import isArray from './isArray';

export const isObjectType = (value: any) => typeof value === 'object';

export default (value: unknown): value is object =>
  !isNullOrUndefined(value) && !isArray(value) && isObjectType(value);
