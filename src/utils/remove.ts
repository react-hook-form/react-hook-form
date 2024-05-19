import compact from './compact';
import convertToArrayPayload from './convertToArrayPayload';
import isUndefined from './isUndefined';
/**
 * Removes elements from an array at the
 * specified index or indexes. If no index is provided,
 * an empty array is returned.
 * @example
 * const arr = ['a', 'b', 'c', 'd'];
 * removeElements(arr, [1, 3]); // Output: ['a', 'c']
 * removeElements(arr, 2);      // Output: ['a', 'b', 'd']
 */
function removeAtIndexes<T>(data: T[], indexes: number[]): T[] {
  let i = 0;
  const temp = [...data];

  for (const index of indexes) {
    temp.splice(index - i, 1);
    i++;
  }

  return compact(temp).length ? temp : [];
}

export default <T>(data: T[], index?: number | number[]): T[] =>
  isUndefined(index)
    ? []
    : removeAtIndexes(
        data,
        (convertToArrayPayload(index) as number[]).sort((a, b) => a - b),
      );
