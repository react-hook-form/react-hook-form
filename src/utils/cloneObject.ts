import isPrimitive from './isPrimitive';

export default function cloneObject<T extends unknown>(
  data: T,
  isWeb: boolean,
): T {
  let copy: any;

  if (isPrimitive(data) || (isWeb && data instanceof File)) {
    return data;
  }

  if (data instanceof Date) {
    copy = new Date(data.getTime());
    return copy;
  }

  const isSet = data instanceof Set;

  if (isSet || data instanceof Map) {
    copy = isSet ? new Set() : new Map();
    // @ts-ignore
    for (const item of isSet ? data : data.keys()) {
      // @ts-ignore
      isSet ? copy.add(item) : copy.set(key, cloneObject(data.get(key), isWeb));
    }
    return copy;
  }

  copy = Array.isArray(data) ? [] : {};

  for (const key in data) {
    copy[key] = cloneObject(data[key], isWeb);
  }

  return copy;
}
