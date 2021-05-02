import isObject from './isObject';
import convertToArrayPayload from './convertToArrayPayload';

export default <T>(value: T) =>
  (convertToArrayPayload(value) as T[]).map((data) => {
    if (isObject(data)) {
      const object: Record<string, boolean> = {};

      for (const key in data) {
        object[key] = true;
      }

      return object;
    }

    return true;
  });
