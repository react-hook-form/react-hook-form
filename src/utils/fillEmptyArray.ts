/**
 * Converts an array to an array of
 * `undefined` * values, or returns `undefined` if
 * the input is not an array.
 */
export default <T>(value: T | T[]): undefined[] | undefined =>
  Array.isArray(value) ? value.map(() => undefined) : undefined;
