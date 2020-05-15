import isArray from './isArray';
import isObject from './isObject';

function mapValueToBoolean(value: any) {
  if (isObject(value)) {
    const object: any = {};

    for (const key in value) {
      object[key] = true;
    }

    return object;
  }

  return [true];
}

export const filterBooleanArray = (value: any): any[] =>
  isArray(value) ? value.map(mapValueToBoolean) : mapValueToBoolean(value);
