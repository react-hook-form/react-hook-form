export default function append<T>(data: T[], value: T | T[]): T[] {
  return [...data, ...(Array.isArray(value) ? value : [value])];
}
