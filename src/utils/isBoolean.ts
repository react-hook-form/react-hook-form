import isEqual from './isEqual';

export default (value: unknown): value is boolean =>
  isEqual(typeof value, 'boolean');
