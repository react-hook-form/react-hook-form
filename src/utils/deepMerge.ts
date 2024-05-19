import isObject from './isObject';
import isPrimitive from './isPrimitive';

/**
 * Deeply merges two objects. If either target or
 * source is a primitive, the source is returned.
 * Otherwise, recursively merges properties of the
 * source object into the target object.
 * @remarks This function mutates the target object.
 * @remarks uses source keys for iteration
 *
 * @example
 * const target = { a: 1, b: { c: 3 } };
 * const source = { b: { d: 4 }, e: 5 };
 * const result = deepMerge(target, source);
 * result // Output: { a: 1, b: { c: 3, d: 4 }, e: 5 }
 */
export default function deepMerge<
  T extends Record<keyof T, any>,
  U extends Record<keyof U, any>,
>(target: T, source: U): T & U {
  if (isPrimitive(target) || isPrimitive(source)) {
    return source;
  }

  for (const key in source) {
    const targetValue = target[key];
    const sourceValue = source[key];

    try {
      target[key] =
        (isObject(targetValue) && isObject(sourceValue)) ||
        (Array.isArray(targetValue) && Array.isArray(sourceValue))
          ? deepMerge(targetValue, sourceValue)
          : sourceValue;
    } catch {}
  }

  return target;
}
