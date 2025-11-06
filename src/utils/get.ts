/**
 * Retrieves a value from a nested object using a path string.
 * Supports dot notation and array bracket notation for accessing nested properties.
 * 
 * @template T - The type of the object to retrieve the value from
 * @param {T} object - The source object to traverse
 * @param {string | null} path - The path to the desired property (e.g., "user.name" or "users[0].email")
 * @param {unknown} [defaultValue] - The value to return if the path is not found or undefined
 * @returns {any} The value at the specified path, or the defaultValue if not found
 * 
 * @example
 * const obj = { user: { name: 'John', emails: ['john@example.com'] } };
 * get(obj, 'user.name'); // Returns: 'John'
 * get(obj, 'user.emails[0]'); // Returns: 'john@example.com'
 * get(obj, 'user.age', 25); // Returns: 25 (default value)
 */
import isKey from './isKey';
import isNullOrUndefined from './isNullOrUndefined';
import isObject from './isObject';
import isUndefined from './isUndefined';
import stringToPath from './stringToPath';

export default <T>(
  object: T,
  path?: string | null,
  defaultValue?: unknown,
): any => {
  if (!path || !isObject(object)) {
    return defaultValue;
  }

  const result = (isKey(path) ? [path] : stringToPath(path)).reduce(
    (result, key) =>
      isNullOrUndefined(result) ? result : result[key as keyof T & object],
    object,
  );

  return isUndefined(result) || result === object
    ? isUndefined(object[path as keyof T])
      ? defaultValue
      : object[path as keyof T]
    : result;
};
