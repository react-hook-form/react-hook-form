import isObject from './isObject';

export function isPlainObject(tempObject: object) {
  const prototypeCopy =
    tempObject.constructor && tempObject.constructor.prototype;

  return (
    isObject(prototypeCopy) && prototypeCopy.hasOwnProperty('isPrototypeOf')
  );
}
