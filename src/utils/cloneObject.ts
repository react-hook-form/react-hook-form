import isFileList from './isFileList';
import isWeb from './isWeb';

export default function cloneObject<T>(data: T): T {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Date) {
    return new Date(data) as T;
  }

  if (
    isWeb &&
    ((typeof Blob !== 'undefined' && data instanceof Blob) || isFileList(data))
  ) {
    return data;
  }

  const isArray = Array.isArray(data);
  const prototype = Object.getPrototypeOf(data);

  if (!isArray && prototype && prototype.constructor !== Object) {
    return data;
  }

  const copy = isArray ? new Array(data.length) : Object.create(prototype);

  for (const key of Object.keys(data)) {
    copy[key] = cloneObject((data as Record<string, unknown>)[key]);
  }

  return copy;
}
