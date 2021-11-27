import { isObjectType } from './isObject';

export default function deepEqual(objectA: any, objectB: any) {
  if (objectA === objectB) {
    return true;
  }

  if (objectA && objectB && isObjectType(objectA) && isObjectType(objectB)) {
    if (objectA.constructor !== objectB.constructor) {
      return false;
    }

    let length, i;

    if (Array.isArray(objectA)) {
      length = objectA.length;

      if (length != objectB.length) {
        return false;
      }

      for (i = length; i-- !== 0; ) {
        if (!deepEqual(objectA[i], objectB[i])) {
          return false;
        }
      }

      return true;
    }

    if (objectA.valueOf !== Object.prototype.valueOf) {
      return objectA.valueOf() === objectB.valueOf();
    }

    const keys = Object.keys(objectA);
    length = keys.length;

    if (length !== Object.keys(objectB).length) {
      return false;
    }

    for (i = length; i-- !== 0; ) {
      if (!Object.prototype.hasOwnProperty.call(objectB, keys[i])) {
        return false;
      }

      const key = keys[i];

      if (key === '_owner' && objectA.$$typeof) {
        continue;
      }

      if (!deepEqual(objectA[key], objectB[key])) {
        return false;
      }
    }

    return true;
  }

  return objectA !== objectA && objectB !== objectB;
}
