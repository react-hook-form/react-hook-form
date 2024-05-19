/**
 * @description Removes falsy values from an array.
 * @returns {TValue[]} A new array with all falsy values removed.
 * @example
 * const array = [0, 1, false, 2, '', 3, null, undefined, NaN, 4];
 * const compactedArray = compact(array);
 * compactedArray // Output: [1, 2, 3, 4]
 */
export default <TValue>(value: TValue[]) =>
  Array.isArray(value) ? value.filter(Boolean) : [];
