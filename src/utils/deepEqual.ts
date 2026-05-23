import isDateObject from './isDateObject';
import isObject from './isObject';
import isPrimitive from './isPrimitive';

export default function deepEqual(
  object1: any,
  object2: any,
  visited = new WeakSet(),
) {
  if (object1 === object2) {
    return true;
  }

  if (isPrimitive(object1) || isPrimitive(object2)) {
    return Object.is(object1, object2);
  }

  if (isDateObject(object1) && isDateObject(object2)) {
    return Object.is(object1.getTime(), object2.getTime());
  }

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  if (visited.has(object1) || visited.has(object2)) {
    return true;
  }

  visited.add(object1);
  visited.add(object2);

  for (const key of keys1) {
    const val1 = object1[key];

    if (!(key in object2)) {
      return false;
    }

    if (key !== 'ref') {
      const val2 = object2[key];

      if (
        (isDateObject(val1) && isDateObject(val2)) ||
        ((isObject(val1) || Array.isArray(val1)) &&
          (isObject(val2) || Array.isArray(val2)))
          ? !deepEqual(val1, val2, visited)
          : !Object.is(val1, val2)
      ) {
        return false;
      }
    }
  }

  return true;
}
