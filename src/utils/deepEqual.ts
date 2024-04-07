import isObject from '../utils/isObject';

import isDateObject from './isDateObject';
import isPrimitive from './isPrimitive';
import isSetObject from './isSetObject';

export default function deepEqual(object1: any, object2: any) {
  if (isPrimitive(object1) || isPrimitive(object2)) {
    return object1 === object2;
  }

  if (isDateObject(object1) && isDateObject(object2)) {
    return object1.getTime() === object2.getTime();
  }

  if (isSetObject(object1) && isSetObject(object2)) {
    if (object1.size !== object2.size) {
      return false;
    }

    const setArr1 = Array.from(object1);
    const setArr2 = Array.from(object2);

    return setArr1.every((elem1): boolean =>
      setArr2.some((elem2): boolean => deepEqual(elem1, elem2)),
    );
  }

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

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
        (isSetObject(val1) && isSetObject(val2)) ||
        (Array.isArray(val1) && Array.isArray(val2))
          ? !deepEqual(val1, val2)
          : val1 !== val2
      ) {
        return false;
      }
    }
  }

  return true;
}
