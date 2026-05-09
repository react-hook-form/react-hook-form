import isDateObject from './isDateObject';
import isObject from './isObject';
import isPrimitive from './isPrimitive';

const REACT_ELEMENT_TYPE = Symbol.for ? Symbol.for('react.element') : 0xeac7;

function isReactElement(obj: any): boolean {
  return (
    obj != null &&
    typeof obj === 'object' &&
    obj.$$typeof === REACT_ELEMENT_TYPE
  );
}

export default function deepEqual(
  object1: any,
  object2: any,
  _internal_visited = new WeakSet(),
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

  // Treat React elements as opaque leaves to avoid traversing
  // internal properties like _owner that may contain Proxies or
  // deeply nested framework internals (e.g. Next.js params/searchParams).
  if (isReactElement(object1) || isReactElement(object2)) {
    return false;
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
          : !Object.is(val1, val2)
      ) {
        return false;
      }
    }
  }

  return true;
}
