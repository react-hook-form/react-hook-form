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

  copy = Array.isArray(data) ? [] : {};

  for (const key in data) {
    copy[key] = cloneObject(data[key], isWeb);
  }

  return copy;
}
