import isObject from './isObject';
import isPlainObject from './isPlainObject';
import isWeb from './isWeb';

export default function cloneObject<T>(data: T): T {
  let copy: any;
  const isArray = Array.isArray(data);

  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set(data);
  } else if (
    !(isWeb && (data instanceof Blob || data instanceof FileList)) &&
    (isArray || isObject(data))
  ) {
    copy = isArray ? [] : {};

    if (!Array.isArray(data) && !isPlainObject(data)) {
      copy = data;
    } else {
      for (const key in data) {
        copy[key] = cloneObject(data[key]);
      }
    }
  } else {
    return data;
  }

  return copy;
}
