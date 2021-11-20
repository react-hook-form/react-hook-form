import isFunction from './isFunction';

export default function objectHasFunction<T>(data: T): boolean {
  for (const key in data) {
    if (isFunction(data[key])) {
      return true;
    }
  }
  return false;
}
