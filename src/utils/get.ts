export default function get(object: any, keys: any, defaultVal?: any): any {
  keys = Array.isArray(keys) ? keys : keys.split('.');
  object = object[keys[0]];
  return object && keys.length > 1
    ? get(object, keys.slice(1), defaultVal)
    : object === undefined
    ? defaultVal
    : object;
}
