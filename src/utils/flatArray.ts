import isArray from './isArray';

export default function flatArray<T>(list: T[]): T[] {
  return list.reduce<T[]>(
    (a, b) => a.concat(isArray<T>(b) ? flatArray(b) : b),
    [],
  );
}
