import compact from './compact';
import isPrimitive from './isPrimitive';

export default <T extends Record<string, any>, U = undefined>(
  obj: T | undefined,
  path: string,
  defaultValue?: U,
) => {
  if (!obj || !path) {
    return defaultValue;
  }

  const pathKeys = compact(path.split(/[,[\].]+?/));

  let result: any = obj;

  for (const key of pathKeys) {
    result = result[key];

    if (isPrimitive(result)) {
      if (result === null) {
        return null;
      }

      if (result === undefined) {
        /**
         * By checking for obj[path] we can handle case like
         * { 'betty.test.test1[0].test1': 'test' }
         * TODO: probably this should be removed and just return the defaultValue
         */
        return obj[path] !== undefined ? obj[path] : defaultValue;
      }

      return result;
    }
  }

  return result;
};
