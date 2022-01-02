import isDateObject from './isDateObject';

function deepEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (isDateObject(a) && isDateObject(b)) {
    return a.getTime() === b.getTime();
  }

  if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) {
    return a === b;
  }

  if (a.prototype !== b.prototype) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  }

  if (keysA.some((keyA) => !(keyA in b))) {
    return false;
  }

  return keysA.every((k) => deepEqual(a[k], b[k]));
}

export default deepEqual;
