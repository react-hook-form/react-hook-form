import isObject from '../utils/isObject';

import isDateObject from './isDateObject';
import isPrimitive from './isPrimitive';

export default function deepEqual(
  object1: any,
  object2: any,
  _internal_visited = new WeakSet(),
) {
  if (isPrimitive(object1) || isPrimitive(object2)) {
    return object1 === object2;
  }

  if (isDateObject(object1) && isDateObject(object2)) {
    return object1.getTime() === object2.getTime();
  }

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  if (_internal_visited.has(object1) || _internal_visited.has(object2)) {
    return true;
  }
  _internal_visited.add(object1);
  _internal_visited.add(object2);

  for (const key of keys1) {
    const val1 = object1[key];

    if (!keys2.includes(key)) {
      return false;
    }

    if (key !== 'ref') {
      const val2 = object2[key];

      if (
        (isDateObject(val1) && isDateObject(val2)) ||
        (isObject(val1) && isObject(val2)) ||
        (Array.isArray(val1) && Array.isArray(val2))
          ? !deepEqual(val1, val2, _internal_visited)
          : val1 !== val2
      ) {
        return false;
      }
    }
  }

  return true;
}
