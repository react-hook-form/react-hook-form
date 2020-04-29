import isArray from './isArray';

export default <T>(data: T[], from: number, to: number): T[] =>
  isArray(data) ? data.splice(to, 0, data.splice(from, 1)[0]) : [];
