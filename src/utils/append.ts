import convertToArrayPayload from './convertToArrayPayload';

/**
 * Add given value or array of values to the end of given array.
 * @returns {T[]} A new array with the appended value(s).
 */
export default <T>(data: T[], value: T | T[]): T[] => [
  ...data,
  ...convertToArrayPayload(value),
];
