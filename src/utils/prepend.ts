export default function prepend<T>(data: T[]): (T | undefined)[];
export default function prepend<T>(data: T[], value: T | T[]): T[];
export default function prepend<T>(
  data: T[],
  value?: T | T[],
): (T | undefined)[] {
  return [...(Array.isArray(value) ? value : [value || undefined]), ...data];
}
