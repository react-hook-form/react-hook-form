import isPrimitive from './isPrimitive';

export default function cloneObject<T extends unknown>(
  data: T,
  isWeb = true,
): T {
  let copy: any;

  if (
    isPrimitive(data) ||
    (isWeb && typeof File === 'function' && data instanceof File)
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
      copy.set(key, cloneObject(data.get(key), isWeb));
    }
    return copy;
  }

  copy = Array.isArray(data) ? [] : {};

  for (const key in data) {
    copy[key] = cloneObject(data[key], isWeb);
  }

  return copy;
}
