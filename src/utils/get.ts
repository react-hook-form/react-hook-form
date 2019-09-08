import { FieldValues } from '../types';
import isUndefined from './isUndefined';
import isArray from "./isArray";

export default function get(
  object: FieldValues,
  keys: string[] | string,
  defaultVal?: any,
): FieldValues | undefined {
  keys = isArray(keys)
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
