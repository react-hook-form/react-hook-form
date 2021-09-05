import isObject from './isObject';

export default function cloneObject<T extends unknown>(data: T): T {
  let copy: any;
  const isArray = Array.isArray(data);

  if (data instanceof Date) {
    copy = new Date(data.getTime());
  } else if (isArray || isObject(data)) {
    copy = isArray ? [] : {};
    for (const key in data) {
      copy[key] = cloneObject(data[key]);
    }
  } else {
    return data;
  }

  return copy;
}
