import isObject from './isObject';
import isPrimitive from './isPrimitive';

export default function cloneObject<T extends unknown>(object: T): T {
  let copy: any;

  if (isPrimitive(object)) {
    return object;
  }

  if (object instanceof Date) {
    copy = new Date(object.getTime());
    return copy;
  }

  copy = Array.isArray(object) ? [] : {};

  for (const key in object) {
    copy[key] = isObject(object[key]) ? cloneObject(object[key]) : object[key];
  }

  return copy;
}
