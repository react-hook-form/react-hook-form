import { Message } from '../types';
import isString from '../utils/isString';
/**
 * Checks if the given value is a string
 * and therefore qualifies as a `Message`.
 * @example
 * const val1 = "Hello, world!";
 * const val2 = 123;
 * isMessage(val1) // Output: true
 * isMessage(val2) // Output: false
 */
export default (value: unknown): value is Message => isString(value);
