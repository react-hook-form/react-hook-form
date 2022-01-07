import isFunction from './isFunction';
import isPrimitive from './isPrimitive';

export default function cloneObject<T>(obj: T): T {
  let clone: any;

  if (isPrimitive(obj)) {
    return obj;
  } else if (obj instanceof Date) {
    clone = new Date(obj);
    return clone;
  } else if (obj instanceof Set) {
    clone = new Set([...obj].map(cloneObject));
    return clone;
  }

  clone = Object.assign({}, obj);

  for (const key in clone) {
    if (isFunction(clone[key])) {
      clone = obj;
      break;
    }

    clone[key] =
      typeof clone[key] === 'object' ? cloneObject(clone[key]) : clone[key];
  }

  if (Array.isArray(obj)) {
    clone.length = obj.length;
    clone = Array.from(clone);
    return clone;
  }

  return clone;
}
