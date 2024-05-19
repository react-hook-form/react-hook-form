import compact from './compact';
import isNullOrUndefined from './isNullOrUndefined';
import isObject from './isObject';
import isUndefined from './isUndefined';

/**
 * Safely retrieves the value at a given
 * path within an object. If the value is not found or
 * is undefined, it returns the provided default value.
 * @example
 * ```typescript
 * const obj = { a: { b: { c: 42 }}};
 * getNestedValue(obj, 'a.b.c')              // Output: 42
 * getNestedValue(obj, 'a.b.x', 'default')   // Output: 'default'
 * getNestedValue(obj, 'a.b.c.d', 'default') // Output: 'default'
 * ```
 */
export default <T>(object: T, path?: string, defaultValue?: unknown): any => {
  if (!path || !isObject(object)) {
    return defaultValue;
  }

  const result = compact(path.split(/[,[\].]+?/)).reduce(
    (result, key) =>
      isNullOrUndefined(result) ? result : result[key as keyof {}],
    object,
  );

  return isUndefined(result) || result === object
    ? isUndefined(object[path as keyof T])
      ? defaultValue
      : object[path as keyof T]
    : result;
};
