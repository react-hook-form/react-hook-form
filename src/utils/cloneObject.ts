import isFunction from './isFunction';
import isObject from './isObject';

export default function cloneObject<T>(data: T): T {
  let copy: any;
  const isArray = Array.isArray(data);

  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set();
    for (const item of data) {
      copy.add(cloneObject(item));
    }
  } else if (data instanceof Map) {
    copy = new Map();
    for (const [key, value] of data) {
      copy.set(cloneObject(key), cloneObject(value));
    }
  } else if (isArray || isObject(data)) {
    copy = isArray ? [] : {};
    for (const key in data) {
      if (isFunction(data[key])) {
        copy = data;
        break;
      }
      copy[key] = cloneObject(data[key]);
    }
  } else {
    return data;
  }

  return copy;
}
