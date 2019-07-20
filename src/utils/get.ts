import { DataType } from '../types';

export default function get(
  object: DataType,
  keys: string[] | string,
  defaultVal?: any,
): DataType {
  keys = Array.isArray(keys)
    ? keys
    : keys
        .replace(/\[/g, '.')
        .replace(/\]/g, '')
        .split('.');
  object = object[keys[0]];
  return object && keys.length > 1
    ? get(object, keys.slice(1), defaultVal)
    : object === undefined
    ? defaultVal
    : object;
}
