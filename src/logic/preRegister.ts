import cloneObject from '../utils/cloneObject';
import isHTMLElement from '../utils/isHTMLElement';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';
import isWeb from '../utils/isWeb';

export default function preRegister<T extends unknown>(
  data: T,
  register: any,
): T {
  let copy: any;

  if (
    isPrimitive(data) ||
    (isWeb && (data instanceof File || isHTMLElement(data)))
  ) {
    return data;
  }

  if (data instanceof Date) {
    copy = new Date(data.getTime());
    return copy;
  }

  if (data instanceof Set) {
    copy = new Set();
    for (const item of data) {
      copy.add(item);
    }
    return copy;
  }

  if (data instanceof Map) {
    copy = new Map();
    for (const [key, value] of data) {
      copy.set(key, cloneObject(value));
    }
    return copy;
  }

  if (Array.isArray(data) || isObject(data)) {
    copy = Array.isArray(data) ? [] : {};

    for (const key in data) {
      copy[key] = cloneObject(data[key]);
    }
  }

  return copy;
}
