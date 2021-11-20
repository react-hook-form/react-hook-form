import isObject from './isObject';
import objectHasFunction from './objectHasFunction';

export default function cloneObject<T>(data: T): T {
  let copy: any;
  const isArray = Array.isArray(data);

  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set(data);
  } else if (isArray || isObject(data)) {
    copy = isArray ? [] : {};
    for (const key in data) {
      if (objectHasFunction(data[key])) {
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
