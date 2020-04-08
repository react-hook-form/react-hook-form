import isArray from './isArray';

export default <T>(data: T[], value?: T | T[]): (T | null)[] => [
  ...(isArray(value) ? value : [value || null]),
  ...data,
];
