/**
 * Swaps the elements at the specified indices in
 * the array.
 * @remarks Mutates the original array.
 * @example
 * const arr = [1, 2, 3, 4];
 * swapElements(arr, 1, 3); // Output: [1, 4, 3, 2]
 */
export default <T>(data: T[], indexA: number, indexB: number): void => {
  [data[indexA], data[indexB]] = [data[indexB], data[indexA]];
};
