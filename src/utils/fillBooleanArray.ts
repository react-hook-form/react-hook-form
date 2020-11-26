import isObject from './isObject';

export default <T>(value: T) =>
  ((Array.isArray(value) ? value : [value]) as T[]).map((data) => {
    if (isObject(data)) {
      const object: Record<string, boolean> = {};

      for (const key in data) {
        object[key] = true;
      }

      return object;
    }

    return true;
  });
