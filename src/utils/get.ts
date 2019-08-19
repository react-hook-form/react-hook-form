import { DataType } from '../types';
import isUndefined from './isUndefined';

export default function get(
  object: DataType,
  keys: string[] | string,
  defaultVal?: any,
): DataType | undefined {
  keys = Array.isArray(keys)
    ? keys
    : keys
        .replace(/\[/g, '.')
        .replace(/\]/g, '')
        .split('.');
  object = object[keys[0]];
  return object && keys.length > 1
    ? get(object, keys.slice(1), defaultVal)
    : isUndefined(object)
    ? defaultVal
    : object;
}
