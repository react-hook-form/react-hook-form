import isPrimitive from './isPrimitive';
import isHTMLElement from './isHTMLElement';
import isWeb from './isWeb';

export default function cloneObject<T extends unknown>(data: T): T {
  let copy: any;

  if (
    isPrimitive(data) ||
    (isWeb && (data instanceof File || isHTMLElement(data)))
  ) {
    return data;
  }

  if (
    !['Set', 'Map', 'Object', 'Date', 'Array'].includes(
      (data as Object).constructor?.name,
    )
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
    for (const key of data.keys()) {
      copy.set(key, cloneObject(data.get(key)));
    }
    return copy;
  }

  copy = Array.isArray(data) ? [] : {};

  for (const key in data) {
    copy[key] = cloneObject(data[key]);
  }

  return copy;
}
