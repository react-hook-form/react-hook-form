import isObject from './isObject';

export default (tempObject: object) => {
  const prototype = Object.getPrototypeOf(tempObject);
  const constructor = prototype
    ? prototype.constructor
    : tempObject.constructor;
  const prototypeCopy = constructor && constructor.prototype;

  return (
    isObject(prototypeCopy) &&
    Object.prototype.hasOwnProperty.call(prototypeCopy, 'isPrototypeOf')
  );
};
