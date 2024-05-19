import isFunction from './isFunction';
/**
 * Checks if an object contains at least one function as a property.
 */
export default <T>(data: T): boolean => {
  for (const key in data) {
    if (isFunction(data[key])) {
      return true;
    }
  }
  return false;
};
