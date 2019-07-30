export default function flatArray<T>(list: T[]): T[] {
  return list.reduce<T[]>(
    (a, b) => a.concat(Array.isArray(b) ? flatArray(b) : b),
    [],
  );
}
