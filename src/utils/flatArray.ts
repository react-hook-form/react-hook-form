export default function flatArray<T>(list: T[]): T[] {
  return list.reduce(
    (a: any, b: any) => a.concat(Array.isArray(b) ? flatArray(b) : b),
    [],
  );
}
