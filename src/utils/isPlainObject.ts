import isObject from './isObject';

export default (tempObject: object) => {
  const prototypeCopy =
    tempObject.constructor && tempObject.constructor.prototype;

  return (
    isObject(prototypeCopy) && Object.hasOwn(prototypeCopy, 'isPrototypeOf')
  );
};
