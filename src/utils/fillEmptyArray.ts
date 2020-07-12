import isArray from './isArray';

export default <T>(value: T | T[]): null[] | null =>
  isArray(value) ? Array(value.length).fill(null) : null;
