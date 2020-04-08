import isArray from './isArray';

export default <T>(data: T[], index: number, value?: T | T[]): T[] => [
  ...data.slice(0, index),
  ...(isArray(value) ? value : value ? [value] : []),
  ...data.slice(index),
];
