import isArray from './isArray';

export default <T>(data: T[], index: number, value?: T | T[]): (T | null)[] => [
  ...data.slice(0, index),
  ...(isArray(value) ? value : [value || null]),
  ...data.slice(index),
];
