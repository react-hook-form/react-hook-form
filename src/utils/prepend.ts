import isArray from './isArray';

export default function<T>(data: T[], value: T | T[]): T[];
export default function<T>(data: T[], value?: undefined): (T | null)[];
export default function<T>(data: T[], value?: T | T[]): (T | null)[] {
  return [...(isArray(value) ? value : [value || null]), ...data];
}
