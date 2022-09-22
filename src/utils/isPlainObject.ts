// Credit and thanks goes to: https://github.com/jonschlinkert/is-plain-object
import isObject from './isObject';

export function isPlainObject(o: object) {
  const prototypeCopy = o.constructor.prototype;

  return !(
    !isObject(prototypeCopy) || !prototypeCopy.hasOwnProperty('isPrototypeOf')
  );
}
