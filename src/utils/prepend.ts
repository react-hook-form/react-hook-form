export default function prepend<T>(data: T[]): (T | null)[];
export default function prepend<T>(data: T[], value: T | T[]): T[];
export default function prepend<T>(data: T[], value?: T | T[]): (T | null)[] {
  return [...(Array.isArray(value) ? value : [value || null]), ...data];
}
