import isNullOrUndefined from './isNullOrUndefined';
import isArray from './isArray';

export const isObjectType = (value: unknown) => typeof value === 'object';

export default <T extends object>(value: unknown): value is T =>
  !isNullOrUndefined(value) && !isArray(value) && isObjectType(value);
