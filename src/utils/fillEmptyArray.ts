import isArray from './isArray';

export default <T>(value: T | T[]): null[] | undefined =>
  isArray(value) ? Array(value.length).fill(null) : undefined;
