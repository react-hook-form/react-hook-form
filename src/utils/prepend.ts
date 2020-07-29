export default function prepend<T>(data: T[]): (T | undefined)[];
export default function prepend<T>(data: T[], value: T | T[]): T[];
export default function prepend<T>(
  data: T[],
  value?: T | T[],
): (T | undefined)[] {
  return [...([] as (T | undefined)[]).concat(value || undefined), ...data];
}
