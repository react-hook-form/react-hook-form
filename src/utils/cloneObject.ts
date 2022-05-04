import isFunction from './isFunction';
import isObject from './isObject';

export default function cloneObject<T>(data: T): T {
  let copy: any;
  const isArray = Array.isArray(data);

  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set(data);
  } else if (globalThis.Blob && data instanceof Blob) {
    copy = data;
  } else if (globalThis.FileList && data instanceof FileList) {
    copy = data;
  } else if (isArray || isObject(data)) {
    copy = isArray ? [] : {};
    for (const key in data) {
      if (!isFunction(data[key])) {
        copy[key] = cloneObject(data[key]);
      }
    }
  } else {
    return data;
  }

  return copy;
}
