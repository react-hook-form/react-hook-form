import isArray from './isArray';

export default function<T>(data: T[], index: number): (T | null)[];
export default function<T>(data: T[], index: number, value: T | T[]): T[];
export default function<T>(
  data: T[],
  index: number,
  value?: T | T[],
): (T | null)[] {
  return [
    ...data.slice(0, index),
    ...(isArray(value) ? value : [value || null]),
    ...data.slice(index),
  ];
}
