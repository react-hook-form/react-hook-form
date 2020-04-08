import isArray from './isArray';

export default <T>(data: T[], value?: T | T[]): T[] => [
  ...(isArray(value) ? value : value ? [value] : []),
  ...data,
];
