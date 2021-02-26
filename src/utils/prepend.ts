export default function prepend<T>(data: T[], value: T | T[]): T[] {
  return [...(Array.isArray(value) ? value : [value]), ...data];
}
