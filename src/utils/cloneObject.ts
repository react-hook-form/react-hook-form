import isObject from './isObject';
import isPlainObject from './isPlainObject';
import isWeb from './isWeb';
/**
 * Deeply clones a given object,
 * including handling special types like Date and Set.
 * It also handles arrays and plain objects.
 */
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

    if (!isArray && !isPlainObject(data)) {
      copy = data;
    } else {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          copy[key] = cloneObject(data[key]);
        }
      }
    }
  } else {
    return data;
  }

  return copy;
}
