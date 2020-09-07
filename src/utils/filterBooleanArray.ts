import isArray from './isArray';
import isObject from './isObject';

function mapValueToBoolean<U>(value: U): boolean[] | Record<string, boolean>[] {
  if (isObject(value)) {
    const object: Record<string, boolean> = {};

    for (const key in value) {
      object[key] = true;
    }

    return [object];
  }

  return [true];
}

export default <T>(value: T) =>
  ((isArray(value) ? value : [value]) as T[]).map(mapValueToBoolean).flat();
