import { EmptyObject } from '../types';

import isObject from './isObject';

/**
 * Checks if the given value is an object
 * with no own properties
 */
export default (value: unknown): value is EmptyObject =>
  isObject(value) && !Object.keys(value).length;
