import compact from './compact';
import isObject from './isObject';

export default <T extends Record<string, any>, U = undefined>(
  obj: T | undefined,
  path: string,
  defaultValue?: U,
) => {
  if (!obj || !path) {
    return defaultValue;
  }

  const pathKeys = compact(path.split(/[,[\].]+?/));
  const pathKeysLastIndex = pathKeys.length - 1;

  let result: any = obj;

  for (const [index, key] of pathKeys.entries()) {
    const currentValue = result[key];

    if (currentValue === null) {
      return null;
    }

    if (currentValue === undefined) {
      result = defaultValue;
      break;
    }

    if (
      index < pathKeysLastIndex &&
      !isObject(currentValue) &&
      !Array.isArray(currentValue)
    ) {
      result = defaultValue;
      break;
    }

    result = currentValue;
  }

  // handle case like 'betty.test.test1[0].test1': 'test'
  if (result === undefined && obj[path] !== undefined) {
    return obj[path];
  }

  return result;
};
