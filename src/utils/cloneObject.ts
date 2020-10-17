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
    copy[key] = cloneObject(object[key]);
  }

  return copy;
}
