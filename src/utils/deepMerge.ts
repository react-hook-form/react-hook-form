import isObject from './isObject';
import isArray from './isArray';
import isPrimitive from './isPrimitive';

export function deepMerge<
  T extends Record<keyof T, any>,
  U extends Record<keyof U, any>
>(target: T, source: U): T & U {
  if (isPrimitive(target) || isPrimitive(source)) {
    return source;
  }

  for (const key in source) {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (
      (isObject(targetValue) && isObject(sourceValue)) ||
      (isArray(targetValue) && isArray(sourceValue))
    ) {
      target[key] = deepMerge(targetValue, sourceValue);
    } else {
      target[key] = sourceValue;
    }
  }

  return target;
}
