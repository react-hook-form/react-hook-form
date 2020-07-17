import isArray from './isArray';

export default <T>(value: T | T[]): undefined[] | undefined =>
  isArray(value) ? Array(value.length).fill(undefined) : undefined;
