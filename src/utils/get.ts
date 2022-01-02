import compact from './compact';
import isNullOrUndefined from './isNullOrUndefined';
import isObject from './isObject';
import isUndefined from './isUndefined';

export default <
  T extends Record<string | number | symbol, any> | undefined,
  U = undefined,
>(
  obj: T,
  path: string,
  defaultValue?: U,
) => {
  if (obj && path) {
    // handle case like 'betty.test.test1[0].test1': 'test'
    if (!isUndefined(obj[path])) {
      return obj[path];
    }

    const pathKeys = compact(path.split(/[,[\].]+?/));
    const pathKeysLastIndex = pathKeys.length - 1;

    let result: any = obj;

    for (const [index, key] of pathKeys.entries()) {
      const currentValue = result[key];

      if (isNullOrUndefined(currentValue)) {
        result = isUndefined(currentValue)
          ? defaultValue ?? currentValue
          : currentValue;
        break;
      }

      if (
        index < pathKeysLastIndex &&
        !isObject(currentValue) &&
        !Array.isArray(currentValue)
      ) {
        result = defaultValue ?? undefined;
        break;
      }

      result = currentValue;
    }

    return result;
  }

  return defaultValue ?? undefined;
};
