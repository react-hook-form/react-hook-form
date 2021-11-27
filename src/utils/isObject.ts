import isNullOrUndefined from './isNullOrUndefined';

export const isObjectType = (value: unknown) => typeof value === 'object';

export default <T extends object>(value: any): value is T =>
  !isNullOrUndefined(value) &&
  !Array.isArray(value) &&
  isObjectType(value) &&
  value.valueOf === Object.prototype.valueOf;
