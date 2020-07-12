import isObject from './isObject';

function mapValueToBoolean(value: any) {
  if (isObject(value)) {
    const object: any = {};

    for (const key in value) {
      object[key] = true;
    }

    return [object];
  }

  return [true];
}

export const filterBooleanArray = <T>(value: T): T[] =>
  Array.isArray(value)
    ? value.map(mapValueToBoolean).flat()
    : mapValueToBoolean(value);
