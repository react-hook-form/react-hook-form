/**
 * Replaces the element at the specified index
 * in the array with a new value and returns the modified array.
 * @remarks This function mutates the original array.
 * @example
 * const fields = ['a', 'b', 'c'];
 * const updatedFields = updateFieldValue(fields, 1, 'x');
 * updatedFields // Output: ['a', 'x', 'c']
 */
export default <T>(fieldValues: T[], index: number, value: T) => {
  fieldValues[index] = value;
  return fieldValues;
};
